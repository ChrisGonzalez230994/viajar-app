import { computed, Directive, input } from '@angular/core';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

export const selectVariants = cva(
  'flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1',
  {
    variants: {
      variant: {
        default: '',
      },
      size: {
        default: 'h-9',
        sm: 'h-8',
        lg: 'h-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export type SelectVariants = VariantProps<typeof selectVariants>;

@Directive({
  selector: '[ubSelect]',
  standalone: true,
  host: {
    '[class]': 'computedClass()',
  },
})
export class UbSelectDirective {
  public readonly userClass = input<string>('', { alias: 'class' });
  public readonly variant = input<SelectVariants['variant']>('default');
  public readonly size = input<SelectVariants['size']>('default');

  protected computedClass = computed(() =>
    cn(selectVariants({ variant: this.variant(), size: this.size() }), this.userClass())
  );
}
