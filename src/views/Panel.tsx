import { FC, PropsWithChildren, ReactNode, useEffect, useRef, useState } from "react";
import AnimateHeight from "react-animate-height";

const DURATION = 300;

const Panel: FC<PropsWithChildren<{ title: ReactNode | string; initiallyDeployed?: boolean, isAccordion?: boolean }>> = ({
  initiallyDeployed,
  children,
}) => {
  const [isDeployed ] = useState(initiallyDeployed || false);
  const dom = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isDeployed)
      setTimeout(() => {
        if (dom.current) dom.current.parentElement?.scrollTo({ top: dom.current.offsetTop - 5, behavior: "smooth" });
      }, DURATION);
  }, [isDeployed]);

  console.log("children: ", children)

  return (
    <div className="panel" ref={dom} style={{ display : !children ? 'none': 'flex'}}>
      <AnimateHeight duration={DURATION} height={isDeployed ? "auto" : 0}>
        {children}
      </AnimateHeight>
    </div>
  );
};

export default Panel;
