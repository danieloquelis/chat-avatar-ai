import { FC, PropsWithChildren } from "react";

export const FadingContainer: FC<PropsWithChildren> = (props) => {
  const { children } = props;
  return (
    <div
      className="p-6"
      style={{
        WebkitMaskImage:
          "linear-gradient(to top, rgba(0,0,0,1), rgba(0,0,0,0))",
        maskImage: "linear-gradient(to top, rgba(0,0,0,1), rgba(0,0,0,0))",
      }}
    >
      {children}
    </div>
  );
};
