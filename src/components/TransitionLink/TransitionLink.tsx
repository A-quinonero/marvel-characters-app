"use client";

import { useRouter } from "next/navigation";
import Link, { type LinkProps } from "next/link";
import { useEffect, useTransition, type ReactNode } from "react";
import { useLoader } from "@/context/LoaderProvider";

type TransitionLinkProps = LinkProps & {
  children: ReactNode;
  className?: string;
  "aria-label"?: string;
};

export default function TransitionLink({ href, children, ...props }: TransitionLinkProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { showLoader, hideLoader } = useLoader();

  useEffect(() => {
    if (isPending) {
      showLoader();
    } else {
      hideLoader();
    }
  }, [isPending, showLoader, hideLoader]);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    startTransition(() => {
      router.push(href.toString());
    });
  };

  return (
    <Link href={href} onClick={handleClick} {...props}>
      {children}
    </Link>
  );
}
