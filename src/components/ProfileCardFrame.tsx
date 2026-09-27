import type { HTMLAttributes } from 'react';
import { useProfileCard } from './MemberCard';

/** The published leadership keeps its own content and layout, sharing only
 * the same ProfileCard material and bounded motion as directory cards. */
export function ProfileCardFrame({ children, className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
  const ref = useProfileCard<HTMLDivElement>();
  return <div {...props} ref={ref} data-profile-card="" className={`${className} member-profile-card`}>
    {children}
    <span className="mpc-shine" aria-hidden="true" />
    <span className="mpc-glare" aria-hidden="true" />
  </div>;
}
