import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import getCategoryInfo from "@/src/utils/getCategoryInfo.utils";
import CategoryCard from "@/src/components/categorycard/CategoryCard";
import Loader from "@/src/components/Loader/Loader";
import Error from "@/src/components/error/Error";
import PageSlider from "@/src/components/pageslider/PageSlider";

function AtoZ({ path }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [categoryInfo, setCategoryInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(0);
  const page = parseInt(searchParams.get("page")) || 1;
  const currentLetter = path.split("/").pop() || "";

  useEffect(() => {
    const fetchAtoZInfo = async () => {
      setLoading(true);
      try {
        const data = await getCategoryInfo(path, page);
        setCategoryInfo(data.data);
        setTotalPages(data.totalPages);
        setLoading(false);
      } catch (err) {
        setError(err);
        setLoading(false);
        console.error("Error fetching category info:", err);
      }
    };
    fetchAtoZInfo();
    window.scrollTo(0, 0);
  }, [path, page]);

  if (loading) return <Loader type="AtoZ" />;
  if (error) {
    return <Error />;
  }
  if (!categoryInfo) {
    return null;
  }
  const handlePageChange = (newPage) => {
    setSearchParams({ page: newPage });
  };

  return (
    <div className="max-w-[1600px] mx-auto flex flex-col mt-[64px] max-md:mt-[50px]">
      <div className="flex flex-col gap-y-2 max-[478px]:gap-y-0 mt-6">
        <h1 className="font-bold text-2xl text-white max-[478px]:text-[18px]">
          Sort By Letters
        </h1>
        <div className="flex gap-x-[7px] flex-wrap justify-start gap-y-2 max-md:justify-start">
          {[
            "All",
            "#",
            "0-9",
            ...Array.from({ length: 26 }, (_, i) =>
              String.fromCharCode(65 + i)
            ),
          ].map((item, index) => {
            const linkPath =
              item.toLowerCase() === "all"
                ? ""
                : item === "#"
                ? "other"
                : item;
            const isActive =
              (currentLetter === "az-list" && item.toLowerCase() === "all") ||
              (currentLetter === "other" && item === "#") ||
              currentLetter === item.toLowerCase();

            return (
              <Link
                to={`/az-list/${linkPath}`}
                key={index}
                className={`text-md bg-[#373646] py-1 px-4 rounded-md font-bold hover:text-black hover:bg-white hover:cursor-pointer transition-all ease-out ${
                  isActive ? "text-black bg-white" : ""
                }`}
              >
                {item}
              </Link>
            );
          })}
        </div>
      </div>
      <div className="w-full flex flex-col gap-y-8">
        <div>
          {categoryInfo && categoryInfo.length > 0 && (
            <CategoryCard
              data={categoryInfo}
              limit={categoryInfo.length}
              showViewMore={false}
              className="mt-8"
              cardStyle="grid-cols-8 max-[1600px]:grid-cols-6 max-[1200px]:grid-cols-4 max-[758px]:grid-cols-3 max-[478px]:grid-cols-3 max-[478px]:gap-x-2"
            />
          )}
          <div className="flex justify-center w-full mt-8">
            <PageSlider
              page={page}
              totalPages={totalPages}
              handlePageChange={handlePageChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default AtoZ;
