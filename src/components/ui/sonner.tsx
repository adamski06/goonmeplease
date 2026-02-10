import { useTheme } from "next-themes";
import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="top-center"
      style={{ top: 'max(env(safe-area-inset-top, 0px), 20px)' }}
      toastOptions={{
        classNames: {
          toast:
            "group toast !rounded-3xl !border !border-white/80 !shadow-[0_8px_32px_rgba(0,0,0,0.12),0_0_0_1px_rgba(255,255,255,0.8)] !backdrop-blur-[24px]",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
        style: {
          background: 'rgba(255, 255, 255, 0.95)',
          color: '#000',
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
