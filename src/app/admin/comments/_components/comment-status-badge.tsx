import { Badge } from "@/components/ui/badge";
import type { CommentStatus } from "@prisma/client";
import { CheckCircle2, XCircle, Clock } from "lucide-react";

interface CommentStatusBadgeProps {
  status: CommentStatus;
}

export function CommentStatusBadge({ status }: CommentStatusBadgeProps) {
  const statusConfig = {
    PENDING: {
      variant: 'secondary',
      Icon: Clock,
      label: 'Pending',
      className: "bg-amber-100 text-amber-800 border-amber-200"
    },
    APPROVED: {
      variant: 'default',
      Icon: CheckCircle2,
      label: 'Approved',
      className: "bg-green-100 text-green-800 border-green-200"
    },
    REJECTED: {
      variant: 'destructive',
      Icon: XCircle,
      label: 'Rejected',
      className: "bg-red-100 text-red-800 border-red-200"
    },
  }[status];
  
  if (!statusConfig) return null;
  
  const { Icon, label, className } = statusConfig;
  
  return (
    <Badge variant="outline" className={className}>
      <Icon className="mr-1.5 h-3.5 w-3.5" />
      {label}
    </Badge>
  );
}
