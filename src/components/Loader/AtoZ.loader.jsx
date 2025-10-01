import { Skeleton } from "../ui/Skeleton/Skeleton";
import CategoryCardLoader from "./CategoryCard.loader";

const SkeletonItems = ({ count, className }) => (
  [...Array(count)].map((_, index) => <Skeleton key={index} className={className} />)
);

function AtoZLoader() {
  const gridClass = "grid-cols-8 max-[1600px]:grid-cols-6 max-[1200px]:grid-cols-4 max-[758px]:grid-cols-3 max-[478px]:grid-cols-3 max-[478px]:gap-x-2";

  return (
    <div className="max-w-[1600px] mx-auto flex flex-col mt-[64px] max-md:mt-[50px]">
      <div className="flex flex-col gap-y-5 mt-6">
        <Skeleton className="w-[200px] h-8" />
        <div className="flex gap-x-[7px] flex-wrap justify-start gap-y-2 max-md:justify-start">
          {[...Array(38)].map((_, index) => (
            <Skeleton
              key={index}
              className="h-[34px] w-[40px] rounded-md"
            />
          ))}
        </div>
      </div>
      <div className="w-full flex flex-col gap-y-8">
        <div>
          <CategoryCardLoader 
            showLabelSkeleton={false}
            className="mt-8"
            gridClass={gridClass}
          />
          <div className="flex justify-center items-center gap-2 mt-8">
            {[...Array(5)].map((_, index) => (
              <Skeleton
                key={index}
                className="w-10 h-10 rounded-lg"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AtoZLoader;
