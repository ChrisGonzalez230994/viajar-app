import { computed, Directive, input } from '@angular/core';
import { cn } from '@/lib/utils';

@Directive({
  selector: '[ubLabel]',
  standalone: true,
  host: {
    '[class]': 'computedClass()',
  },
})
export class UbLabelDirective {
  public readonly userClass = input<string>('', { alias: 'class' });

  protected computedClass = computed(() =>
    cn(
      'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
      this.userClass()
    )
  );
}
