import { computed, Directive, input } from '@angular/core';
import { cn } from '@/lib/utils';

@Directive({
  selector: '[ubSeparator]',
  standalone: true,
  host: {
    '[class]': 'computedClass()',
    role: 'separator',
    '[attr.aria-orientation]': 'orientation()',
  },
})
export class UbSeparatorDirective {
  public readonly userClass = input<string>('', { alias: 'class' });
  public readonly orientation = input<'horizontal' | 'vertical'>('horizontal');

  protected computedClass = computed(() =>
    cn(
      'shrink-0 bg-border',
      this.orientation() === 'horizontal' ? 'h-[1px] w-full' : 'h-full w-[1px]',
      this.userClass()
    )
  );
}
