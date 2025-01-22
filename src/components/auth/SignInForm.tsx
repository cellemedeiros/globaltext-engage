import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { authAppearance } from "./authStyles";

interface SignInFormProps {
  onToggleForm: () => void;
}

const SignInForm = ({ onToggleForm }: SignInFormProps) => {
  return (
    <>
      <Auth
        supabaseClient={supabase}
        appearance={authAppearance}
        theme="light"
        providers={["google"]}
        redirectTo={window.location.origin}
        view="sign_in"
        showLinks={false}
      />
      <p className="text-center text-sm text-muted-foreground mt-3">
        Don't have an account?{" "}
        <button
          onClick={onToggleForm}
          className="text-primary hover:text-primary-light"
        >
          Sign up
        </button>
      </p>
    </>
  );
};

export default SignInForm;