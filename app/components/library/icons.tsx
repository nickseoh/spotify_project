// Simple inline SVG icons (generic shapes, drawn for this project).
type P = { size?: number; className?: string }

const svg = (size: number, className: string | undefined, children: React.ReactNode, fill = 'currentColor') => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} className={className} aria-hidden="true">
    {children}
  </svg>
)

const stroke = { fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' } as const

export const HomeIcon = ({ size = 24, className }: P) =>
  svg(size, className, <path {...stroke} d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />)

export const SearchIcon = ({ size = 20, className }: P) =>
  svg(size, className, <><circle {...stroke} cx="11" cy="11" r="7" /><path {...stroke} d="m20 20-3.5-3.5" /></>)

export const PlusIcon = ({ size = 16, className }: P) =>
  svg(size, className, <path {...stroke} d="M12 5v14M5 12h14" />)

export const PlayIcon = ({ size = 24, className }: P) =>
  svg(size, className, <path d="M7 4.5v15a.8.8 0 0 0 1.2.7l12-7.5a.8.8 0 0 0 0-1.4l-12-7.5A.8.8 0 0 0 7 4.5z" />)

export const PauseIcon = ({ size = 24, className }: P) =>
  svg(size, className, <><rect x="6" y="4" width="4" height="16" rx="1" /><rect x="14" y="4" width="4" height="16" rx="1" /></>)

export const NextIcon = ({ size = 20, className }: P) =>
  svg(size, className, <><path d="M5 5.5v13a.7.7 0 0 0 1.1.6l9.5-6.5a.7.7 0 0 0 0-1.2L6.1 4.9A.7.7 0 0 0 5 5.5z" /><rect x="17" y="5" width="2.5" height="14" rx="1" /></>)

export const PrevIcon = ({ size = 20, className }: P) =>
  svg(size, className, <g transform="matrix(-1 0 0 1 24 0)"><path d="M5 5.5v13a.7.7 0 0 0 1.1.6l9.5-6.5a.7.7 0 0 0 0-1.2L6.1 4.9A.7.7 0 0 0 5 5.5z" /><rect x="17" y="5" width="2.5" height="14" rx="1" /></g>)

export const ShuffleIcon = ({ size = 20, className }: P) =>
  svg(size, className, <path {...stroke} d="M3 7h3.5c4 0 6 10 10 10H21m0 0-3-3m3 3-3 3M3 17h3.5c1.6 0 2.8-1.6 3.9-3.6M21 7h-4.5c-1.6 0-2.8 1.6-3.9 3.6M21 7l-3-3m3 3-3 3" />)

export const RepeatIcon = ({ size = 20, className }: P) =>
  svg(size, className, <path {...stroke} d="M17 2l3 3-3 3M4 11V9a4 4 0 0 1 4-4h12M7 22l-3-3 3-3m13-3v2a4 4 0 0 1-4 4H4" />)

export const ClockIcon = ({ size = 16, className }: P) =>
  svg(size, className, <><circle {...stroke} cx="12" cy="12" r="9" /><path {...stroke} d="M12 7v5l3 2" /></>)

export const MoreIcon = ({ size = 24, className }: P) =>
  svg(size, className, <><circle cx="5" cy="12" r="1.8" /><circle cx="12" cy="12" r="1.8" /><circle cx="19" cy="12" r="1.8" /></>)

export const PencilIcon = ({ size = 16, className }: P) =>
  svg(size, className, <path {...stroke} d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16zM13.5 6.5l4 4" />)

export const TrashIcon = ({ size = 16, className }: P) =>
  svg(size, className, <path {...stroke} d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />)

export const CloseIcon = ({ size = 20, className }: P) =>
  svg(size, className, <path {...stroke} d="M6 6l12 12M18 6 6 18" />)

export const MusicNoteIcon = ({ size = 48, className }: P) =>
  svg(size, className, <><path {...stroke} strokeWidth={1.5} d="M9 18V5l11-2v13" /><circle {...stroke} strokeWidth={1.5} cx="6.5" cy="18" r="2.5" /><circle {...stroke} strokeWidth={1.5} cx="17.5" cy="16" r="2.5" /></>)

export const LibraryIcon = ({ size = 24, className }: P) =>
  svg(size, className, <path {...stroke} d="M4 3v18M9 3v18M14 4l5 16" />)

export const ListIcon = ({ size = 16, className }: P) =>
  svg(size, className, <path {...stroke} d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />)

export const CheckIcon = ({ size = 16, className }: P) =>
  svg(size, className, <path {...stroke} d="m5 12 5 5L20 7" />)

export const VolumeIcon = ({ size = 18, className }: P) =>
  svg(size, className, <><path d="M4 9v6h4l5 4V5L8 9z" /><path {...stroke} d="M16 9a4 4 0 0 1 0 6M18.5 6.5a7.5 7.5 0 0 1 0 11" /></>)

export const PanelIcon = ({ size = 18, className }: P) =>
  svg(size, className, <><rect {...stroke} x="3" y="4" width="18" height="16" rx="2" /><path {...stroke} d="M15 4v16" /></>)

export const SortArrowIcon = ({ size = 12, className, up = true }: P & { up?: boolean }) =>
  svg(size, className, <path d={up ? 'M12 6l7 10H5z' : 'M12 18 5 8h14z'} />)
