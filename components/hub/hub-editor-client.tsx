'use client'

import { useState, useEffect } from 'react'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Loader2 } from 'lucide-react'
import { SortableBlockItem } from './sortable-block-item'
import { AddBlockDialog } from './add-block-dialog-new'
import { HubPreview } from './hub-preview'
import { useToast } from '@/hooks/use-toast'

interface Block {
  id: string
  type: 'property' | 'link' | 'image' | 'video' | 'text'
  title?: string | null
  subtitle?: string | null
  url?: string | null
  mediaUrl?: string | null
  propertyId?: string | null
  position: number
  isVisible: boolean
  property?: {
    id: string
    title: string
    slug: string
    coverAssetId: string | null
    status: string
  } | null
}

interface HubEditorClientProps {
  teamSlug: string
  accentColor: string
  themeMode: 'dark' | 'light'
  backgroundColor: string
}

export function HubEditorClient({ teamSlug, accentColor, themeMode, backgroundColor }: HubEditorClientProps) {
  const [blocks, setBlocks] = useState<Block[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [editingBlock, setEditingBlock] = useState<Block | null>(null)
  const { toast } = useToast()

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Fetch blocks
  useEffect(() => {
    fetchBlocks()
  }, [])

  const fetchBlocks = async () => {
    try {
      const res = await fetch('/api/hub/blocks')
      if (!res.ok) throw new Error('Failed to fetch blocks')
      const data = await res.json()
      setBlocks(data.blocks || [])
    } catch (error) {
      console.error('Error fetching blocks:', error)
      toast({
        title: 'Error',
        description: 'Failed to load hub blocks',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (!over || active.id === over.id) return

    const oldIndex = blocks.findIndex((b) => b.id === active.id)
    const newIndex = blocks.findIndex((b) => b.id === over.id)

    const newBlocks = arrayMove(blocks, oldIndex, newIndex)
    setBlocks(newBlocks)

    // Save new order
    try {
      setSaving(true)
      const res = await fetch('/api/hub/blocks/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blockIds: newBlocks.map(b => b.id) }),
      })

      if (!res.ok) throw new Error('Failed to reorder')

      toast({
        title: 'Saved',
        description: 'Block order updated',
      })
    } catch (error) {
      console.error('Error reordering:', error)
      toast({
        title: 'Error',
        description: 'Failed to save order',
      })
      // Revert on error
      fetchBlocks()
    } finally {
      setSaving(false)
    }
  }

  const handleToggleVisibility = async (blockId: string, isVisible: boolean) => {
    try {
      const res = await fetch(`/api/hub/blocks/${blockId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isVisible }),
      })

      if (!res.ok) throw new Error('Failed to update')

      setBlocks(blocks.map(b => b.id === blockId ? { ...b, isVisible } : b))

      toast({
        title: isVisible ? 'Block shown' : 'Block hidden',
        description: isVisible ? 'Block is now visible on your hub' : 'Block is now hidden from your hub',
      })
    } catch (error) {
      console.error('Error toggling visibility:', error)
      toast({
        title: 'Error',
        description: 'Failed to update block',
      })
    }
  }

  const handleDeleteBlock = async (blockId: string) => {
    try {
      const res = await fetch(`/api/hub/blocks/${blockId}`, {
        method: 'DELETE',
      })

      if (!res.ok) throw new Error('Failed to delete')

      setBlocks(blocks.filter(b => b.id !== blockId))

      toast({
        title: 'Block deleted',
        description: 'Block removed from your hub',
      })
    } catch (error) {
      console.error('Error deleting block:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete block',
      })
    }
  }

  const handleAddBlock = async (blockData: Omit<Block, 'id' | 'position' | 'isVisible'>) => {
    try {
      const res = await fetch('/api/hub/blocks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...blockData,
          position: blocks.length,
        }),
      })

      if (!res.ok) throw new Error('Failed to create block')

      const data = await res.json()
      setBlocks([...blocks, data.block])

      toast({
        title: 'Block added',
        description: 'New block added to your hub',
      })

      setAddDialogOpen(false)
    } catch (error) {
      console.error('Error adding block:', error)
      toast({
        title: 'Error',
        description: 'Failed to add block',
      })
    }
  }

  const handleUpdateBlock = async (blockId: string, blockData: any) => {
    try {
      const res = await fetch(`/api/hub/blocks/${blockId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(blockData),
      })

      if (!res.ok) throw new Error('Failed to update block')

      const data = await res.json()
      setBlocks(blocks.map(b => b.id === blockId ? data.block : b))

      toast({
        title: 'Block updated',
        description: 'Block has been updated',
      })

      setEditingBlock(null)
    } catch (error) {
      console.error('Error updating block:', error)
      toast({
        title: 'Error',
        description: 'Failed to update block',
      })
    }
  }

  const handleEditBlock = (block: Block) => {
    setEditingBlock(block)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    )
  }

  return (
    <div className="grid lg:grid-cols-2 gap-6 h-[calc(100vh-200px)]">
      {/* Editor Panel */}
      <div className="space-y-4 overflow-y-auto pr-2">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold">Blocks</h2>
            <p className="text-sm text-slate-600">Drag to reorder, toggle visibility</p>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={() => window.open(`/u/${teamSlug}`, '_blank')} 
              size="sm"
              variant="outline"
              className="gap-2"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Live Preview
            </Button>
            <Button onClick={() => setAddDialogOpen(true)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Block
            </Button>
          </div>
        </div>

        {blocks.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="max-w-sm mx-auto">
              <h3 className="text-lg font-semibold mb-2">No blocks yet</h3>
              <p className="text-sm text-slate-600 mb-4">
                Start building your hub by adding blocks like properties, links, images, and more.
              </p>
              <Button onClick={() => setAddDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Block
              </Button>
            </div>
          </Card>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={blocks.map(b => b.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3">
                {blocks.map((block) => (
                  <SortableBlockItem
                    key={block.id}
                    block={block}
                    onToggleVisibility={handleToggleVisibility}
                    onDelete={handleDeleteBlock}
                    onEdit={handleEditBlock}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}

        {saving && (
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Loader2 className="h-4 w-4 animate-spin" />
            Saving...
          </div>
        )}
      </div>

      {/* Preview Panel */}
      <div className="hidden lg:block sticky top-6 h-fit">
        <div className="bg-slate-100 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Live Preview</h2>
            <a
              href={`/u/${teamSlug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:underline"
            >
              View Public Page →
            </a>
          </div>
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <HubPreview
              blocks={blocks.filter(b => b.isVisible)}
              teamSlug={teamSlug}
              accentColor={accentColor}
              themeMode={themeMode}
              backgroundColor={backgroundColor}
            />
          </div>
        </div>
      </div>

      {/* Add Block Dialog */}
      <AddBlockDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onAdd={handleAddBlock}
      />

      {/* Edit Block Dialog */}
      <AddBlockDialog
        open={!!editingBlock}
        onOpenChange={(open) => !open && setEditingBlock(null)}
        onAdd={handleAddBlock}
        onUpdate={handleUpdateBlock}
        editBlock={editingBlock}
      />
    </div>
  )
}
