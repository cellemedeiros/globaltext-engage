import { ThemeSupa } from "@supabase/auth-ui-shared";

export const authAppearance = {
  theme: ThemeSupa,
  variables: {
    default: {
      colors: {
        brand: '#1EAEDB',
        brandAccent: '#33C3F0',
        inputBackground: 'white',
        inputBorder: 'hsl(var(--border))',
        inputBorderFocus: '#1EAEDB',
        inputBorderHover: '#1EAEDB',
        inputPlaceholder: 'hsl(var(--muted-foreground))',
      },
      space: {
        inputPadding: '0.75rem',
        buttonPadding: '0.75rem',
      },
      borderWidths: {
        buttonBorderWidth: '1px',
        inputBorderWidth: '1px',
      },
      radii: {
        borderRadiusButton: '0.5rem',
        buttonBorderRadius: '0.5rem',
        inputBorderRadius: '0.5rem',
      },
      fonts: {
        bodyFontFamily: 'Inter, sans-serif',
        buttonFontFamily: 'Inter, sans-serif',
        inputFontFamily: 'Inter, sans-serif',
        labelFontFamily: 'Inter, sans-serif',
      },
    },
  },
  className: {
    container: 'flex flex-col gap-3',
    button: 'w-full bg-primary hover:bg-primary-light text-white font-medium py-2 px-4 rounded-lg transition-colors',
    label: 'block text-sm font-medium text-foreground mb-1',
    input: 'w-full rounded-lg border bg-background px-3 py-2 text-sm ring-offset-background transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
    divider: 'my-3 text-xs text-muted-foreground',
    message: 'text-sm text-foreground/80 mb-3',
    anchor: 'text-primary hover:text-primary-light transition-colors',
    auth_button: 'w-full bg-primary hover:bg-primary-light text-white font-medium py-2 px-4 rounded-lg transition-colors',
    auth_button_container: 'flex flex-col gap-2',
  },
};