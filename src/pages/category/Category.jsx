import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import getCategoryInfo from "@/src/utils/getCategoryInfo.utils";
import CategoryCard from "@/src/components/categorycard/CategoryCard";
import CategoryCardLoader from "@/src/components/Loader/CategoryCard.loader";
import { useNavigate } from "react-router-dom";
import PageSlider from "@/src/components/pageslider/PageSlider";

function Category({ path, label }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [categoryInfo, setCategoryInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(0);
  const page = parseInt(searchParams.get("page")) || 1;
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchCategoryInfo = async () => {
      setLoading(true);
      try {
        const data = await getCategoryInfo(path, page);
        setCategoryInfo(data.data);
        setTotalPages(data.totalPages);
        setLoading(false);
      } catch (err) {
        setError(err);
        console.error("Error fetching category info:", err);
        setLoading(false);
      }
    };
    fetchCategoryInfo();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [path, page]);

  const handlePageChange = (newPage) => {
    setSearchParams({ page: newPage });
  };

  const categoryGridClass = "grid-cols-8 max-[1600px]:grid-cols-6 max-[1200px]:grid-cols-4 max-[758px]:grid-cols-3 max-[478px]:grid-cols-3 max-[478px]:gap-x-2";

  return (
    <div className="max-w-[1600px] mx-auto flex flex-col mt-[64px] max-md:mt-[50px]">
      <div className="w-full flex flex-col gap-y-8 mt-6">
        {loading ? (
          <CategoryCardLoader className={"max-[478px]:mt-2"} gridClass={categoryGridClass} />
        ) : page > totalPages ? (
          <div className="flex flex-col gap-y-4">
            <h1 className="font-bold text-2xl text-white max-[478px]:text-[18px]">
              {label.split("/").pop()}
            </h1>
            <p className="text-white text-lg max-[478px]:text-[16px] max-[300px]:leading-6">
              You came a long way, go back <br className="max-[300px]:hidden" />
              nothing is here
            </p>
          </div>
        ) : categoryInfo && categoryInfo.length > 0 ? (
          <div className="flex flex-col gap-y-2 max-[478px]:gap-y-0">
            <h1 className="font-bold text-2xl text-white max-[478px]:text-[18px]">
              {label.split("/").pop()}
            </h1>
            <CategoryCard
              data={categoryInfo}
              showViewMore={false}
              className="mt-0"
              gridClass={categoryGridClass}
              categoryPage={true}
              path={path}
            />
            <div className="flex justify-center w-full mt-8">
              <PageSlider
                page={page}
                totalPages={totalPages}
                handlePageChange={handlePageChange}
              />
            </div>
          </div>
        ) : error ? (
          <div className="flex flex-col gap-y-4">
            <h1 className="font-bold text-2xl text-white max-[478px]:text-[18px]">
              {label.split("/").pop()}
            </h1>
            <p className="text-white text-lg max-[478px]:text-[16px]">
              Couldn't get {label.split("/").pop()} results, please try again
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-y-4">
            <h1 className="font-bold text-2xl text-white max-[478px]:text-[18px]">
              {label.split("/").pop()}
            </h1>
            <p className="text-white text-lg max-[478px]:text-[16px]">
              No results found for: {label.split("/").pop()}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Category;
