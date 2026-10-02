import React from 'react'

export type BadgeVariant =
  | 'draft'
  | 'submitted'
  | 'review'
  | 'approved'
  | 'rejected'
  | 'pass'
  | 'fail'
  | 'na'
  | 'info'
  | 'warning'

export interface BadgeProps {
  variant?: BadgeVariant
  children: React.ReactNode
  className?: string
}

const variantMap: Record<BadgeVariant, string> = {
  draft: 'badge-draft',
  submitted: 'badge-submitted',
  review: 'badge-review',
  approved: 'badge-approved',
  rejected: 'badge-rejected',
  pass: 'badge-pass',
  fail: 'badge-fail',
  na: 'badge-na',
  info: 'badge-info',
  warning: 'badge-warning',
}

export function statusToBadgeVariant(status: string): BadgeVariant {
  switch (status) {
    case 'draft': return 'draft'
    case 'submitted': return 'submitted'
    case 'under_review': return 'review'
    case 'approved': return 'approved'
    case 'rejected': return 'rejected'
    default: return 'info'
  }
}

export default function Badge({ variant = 'info', children, className = '' }: BadgeProps) {
  return (
    <span className={`badge ${variantMap[variant]} ${className}`}>
      {children}
    </span>
  )
}

export function StatusBadge({ status }: { status: string }) {
  return <Badge variant={statusToBadgeVariant(status)}>{status.replace('_', ' ')}</Badge>
}

export function PassFailBadge({ pass }: { pass: boolean | null }) {
  if (pass === true) return <Badge variant="pass">PASS</Badge>
  if (pass === false) return <Badge variant="fail">FAIL</Badge>
  return <Badge variant="na">N/A</Badge>
}

export { Badge }
