import { useTheme } from "next-themes"
import { Toaster as Sonner, toast } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  )
}

export const useToast = () => {
  return {
    toast: (props: { title?: string; description?: string; variant?: 'default' | 'destructive' }) => {
      if (props.variant === 'destructive') {
        toast.error(props.title, { description: props.description });
      } else {
        toast.success(props.title, { description: props.description });
      }
    },
    success: (title: string, desc?: string) => toast.success(title, { description: desc }),
    error: (title: string, desc?: string) => toast.error(title, { description: desc }),
    info: (title: string, desc?: string) => toast.info(title, { description: desc }),
  };
};

export { Toaster, toast }
