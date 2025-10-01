import { Skeleton } from "../ui/Skeleton/Skeleton";
import CategoryCardLoader from "./CategoryCard.loader";
import SidecardLoader from "./Sidecard.loader";

const GenreLoader = () => (
  <div className="flex flex-wrap gap-3">
    {[...Array(8)].map((_, index) => (
      <Skeleton
        key={index}
        className="h-[35px] w-[120px] rounded-full"
      />
    ))}
  </div>
);

function CategoryLoader() {
  return (
    <div className="w-full flex flex-col gap-y-4 mt-[64px] max-md:mt-[50px]">
      <div className="w-full px-4 grid grid-cols-[minmax(0,75%),minmax(0,25%)] gap-x-6 max-[1200px]:flex max-[1200px]:flex-col max-[1200px]:gap-y-10 max-[478px]:px-2">
        <div>
          <div className="flex items-center mb-6">
            <Skeleton className="h-8 w-[200px]" />
          </div>
          <CategoryCardLoader className="mt-0" />
          <div className="flex justify-center items-center gap-2 mt-8">
            {[...Array(5)].map((_, index) => (
              <Skeleton
                key={index}
                className="w-10 h-10 rounded-lg"
              />
            ))}
          </div>
        </div>
        <div className="w-full flex flex-col gap-y-10">
          <SidecardLoader title="Top 10" />
          <GenreLoader />
        </div>
      </div>
    </div>
  );
}

export default CategoryLoader;