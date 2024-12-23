import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";

// Payment and translation logic
export const createTranslationAfterPayment = async (session: Session, pendingTranslation: string | null, amount: string | null) => {
  if (!pendingTranslation || !session) {
    console.error('No pending translation or session found');
    return;
  }
  try {
    const { fileName, fileContent, wordCount } = JSON.parse(pendingTranslation);

    const { data: translation, error: insertError } = await supabase
      .from('translations')
      .insert({
        user_id: session.user.id,
        document_name: fileName,
        content: fileContent,
        word_count: wordCount,
        status: 'pending',
        amount_paid: amount ? parseFloat(amount) : 0,
        source_language: 'en',
        target_language: 'pt',
        price_offered: amount ? parseFloat(amount) * 0.7 : 0,
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      })
      .select()
      .single();

    if (insertError) throw insertError;

    console.log('Translation created successfully:', translation);

    const { data: translators, error: translatorsError } = await supabase
      .from('profiles')
      .select('id')
      .eq('role', 'translator')
      .eq('is_approved_translator', true);

    if (translatorsError) throw translatorsError;

    if (translators?.length) {
      const notifications = translators.map(translator => ({
        user_id: translator.id,
        title: 'New Translation Available',
        message: `A new translation project "${fileName}" is available for claiming.`,
        read: false
      }));

      const { error: notificationError } = await supabase
        .from('notifications')
        .insert(notifications);

      if (notificationError) throw notificationError;
      console.log('Translator notifications created');
    }

    localStorage.removeItem('pendingTranslation');
  } catch (error) {
    console.error('Error creating translation:', error);
  }
};

// Updated Vite Configuration
export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  server: {
    port: 3000,
  },
  optimizeDeps: {
    exclude: ["some-package"],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return id.toString().split('node_modules/')[1].split('/')[0].toString();
          }
        },
      },
    },
  },
  esbuild: {
    loader: "tsx",
  },
});


