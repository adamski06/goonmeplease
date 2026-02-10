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
      offset={60}
      toastOptions={{
        classNames: {
          toast:
            "group toast !rounded-3xl !border !border-white/40 !shadow-[0_8px_32px_rgba(0,0,0,0.15),0_0_0_1px_rgba(255,255,255,0.5)] !backdrop-blur-[20px]",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
        style: {
          background: 'rgba(255, 255, 255, 0.55)',
          color: '#000',
          WebkitBackdropFilter: 'blur(20px)',
          backdropFilter: 'blur(20px)',
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
