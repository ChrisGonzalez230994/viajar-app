import { computed, Directive, input } from '@angular/core';
import { cn } from '@/lib/utils';

@Directive({
  selector: '[ubSkeleton]',
  standalone: true,
  host: {
    '[class]': 'computedClass()',
  },
})
export class UbSkeletonDirective {
  public readonly userClass = input<string>('', { alias: 'class' });

  protected computedClass = computed(() =>
    cn('animate-pulse rounded-md bg-primary/10', this.userClass())
  );
}
