import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

// Simple AlertDialog implementation using existing Dialog component
const AlertDialog = ({ children, ...props }) => {
  return <Dialog {...props}>{children}</Dialog>
}

const AlertDialogTrigger = DialogTrigger

const AlertDialogContent = ({ children, ...props }) => {
  return <DialogContent {...props}>{children}</DialogContent>
}

const AlertDialogHeader = DialogHeader

const AlertDialogFooter = ({ className, children, ...props }) => {
  return (
    <DialogFooter className={`sm:justify-end ${className}`} {...props}>
      {children}
    </DialogFooter>
  )
}

const AlertDialogTitle = DialogTitle

const AlertDialogDescription = DialogDescription

const AlertDialogAction = React.forwardRef(({ className, children, ...props }, ref) => (
  <Button
    ref={ref}
    className={className}
    {...props}
  >
    {children}
  </Button>
))
AlertDialogAction.displayName = "AlertDialogAction"

const AlertDialogCancel = React.forwardRef(({ className, children, ...props }, ref) => (
  <Button
    ref={ref}
    variant="outline"
    className={className}
    {...props}
  >
    {children}
  </Button>
))
AlertDialogCancel.displayName = "AlertDialogCancel"

export {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
}
