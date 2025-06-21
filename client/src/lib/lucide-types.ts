// Extend Lucide types to support className prop
import 'lucide-react';

declare module 'lucide-react' {
  interface LucideProps {
    className?: string;
  }
}
