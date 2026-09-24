import { faFaceMeh } from '@fortawesome/free-solid-svg-icons';
import Seo from '@/components/Seo';
import EmptyState from '@/components/EmptyState';
import Button from '@/components/Button';

export default function NotFound() {
  return (
    <>
      <Seo title="Page not found" noIndex />
      <div className="section"><div className="container">
        <EmptyState
          icon={faFaceMeh}
          title="This page fizzled out"
          message="The link may be old or mistyped. The price list is a good place to start."
          action={<Button href="/products">Go to the price list</Button>}
        />
      </div></div>
    </>
  );
}
