'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { GripVertical, Eye, EyeOff, Trash2, Pencil, Link as LinkIcon, Image, Video, FileText, Building2 } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

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

interface SortableBlockItemProps {
  block: Block
  onToggleVisibility: (id: string, isVisible: boolean) => void
  onDelete: (id: string) => void
  onEdit: (block: Block) => void
}

const blockIcons = {
  property: Building2,
  link: LinkIcon,
  image: Image,
  video: Video,
  text: FileText,
}

const blockLabels = {
  property: 'Property',
  link: 'Link',
  image: 'Image',
  video: 'Video',
  text: 'Text',
}

export function SortableBlockItem({ block, onToggleVisibility, onDelete, onEdit }: SortableBlockItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const Icon = blockIcons[block.type]

  const getBlockTitle = () => {
    if (block.type === 'property') {
      return block.title || 'Property Block'
    }
    return block.title || `Untitled ${blockLabels[block.type]}`
  }

  const getBlockSubtitle = () => {
    if (block.type === 'property') {
      return 'Property'
    }
    if (block.type === 'link' && block.url) {
      return block.url
    }
    return block.subtitle || blockLabels[block.type]
  }

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`transition-all ${!block.isVisible ? 'opacity-50' : ''}`}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          {/* Drag Handle */}
          <button
            className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-600 transition-colors"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-5 w-5" />
          </button>

          {/* Icon */}
          <div className="flex-shrink-0">
            <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center">
              <Icon className="h-5 w-5 text-slate-600" />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm truncate">{getBlockTitle()}</h3>
            <p className="text-xs text-slate-500 truncate">{getBlockSubtitle()}</p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(block)}
              className="h-8 w-8 p-0 text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              title="Edit block"
            >
              <Pencil className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => onToggleVisibility(block.id, !block.isVisible)}
              className="h-8 w-8 p-0"
              title={block.isVisible ? 'Hide block' : 'Show block'}
            >
              {block.isVisible ? (
                <Eye className="h-4 w-4" />
              ) : (
                <EyeOff className="h-4 w-4" />
              )}
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete block?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will remove "{getBlockTitle()}" from your hub. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => onDelete(block.id)}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
