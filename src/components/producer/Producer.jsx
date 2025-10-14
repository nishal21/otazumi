import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import Error from "../error/Error";
import CategoryCard from "../categorycard/CategoryCard";
import { useEffect, useState } from "react";
import getProducer from "@/src/utils/getProducer.utils";
import Loader from "../Loader/Loader";
import PageSlider from "../pageslider/PageSlider";

function Producer() {
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [producerInfo, setProducerInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(0);
  const page = parseInt(searchParams.get("page")) || 1;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducerInfo = async () => {
      setLoading(true);
      try {
        const data = await getProducer(id, page);
        setProducerInfo(data.data);
        setTotalPages(data.totalPages);
        setLoading(false);
      } catch (err) {
        setError(err);
        console.error("Error fetching category info:", err);
      }
    };
    fetchProducerInfo();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id, page]);

  if (loading) return <Loader type="producer" />;
  if (error) {
    navigate("/error-page");
    return <Error />;
  }
  if (!producerInfo) {
    navigate("/404-not-found-page");
    return null;
  }

  const handlePageChange = (newPage) => {
    setSearchParams({ page: newPage });
  };

  const producerName = (id.charAt(0).toUpperCase() + id.slice(1)).split("-").join(" ");

  return (
    <div className="max-w-[1600px] mx-auto flex flex-col mt-[64px] max-md:mt-[50px]">
      <div className="w-full flex flex-col gap-y-8 mt-6">
        {loading ? (
          <Loader type="producer" />
        ) : page > totalPages ? (
          <div className="flex flex-col gap-y-4">
            <h1 className="font-bold text-2xl text-white max-[478px]:text-[18px]">
              {producerName} Anime
            </h1>
            <p className='text-white text-lg max-[478px]:text-[16px] max-[300px]:leading-6'>
              You came a long way, go back <br className='max-[300px]:hidden' />nothing is here
            </p>
          </div>
        ) : producerInfo && producerInfo.length > 0 ? (
          <div className="flex flex-col gap-y-2 max-[478px]:gap-y-0">
            <h1 className="font-bold text-2xl text-white max-[478px]:text-[18px]">
              {producerName} Anime
            </h1>
            <CategoryCard
              data={producerInfo}
              showViewMore={false}
              className="mt-0"
              cardStyle="grid-cols-8 max-[1600px]:grid-cols-6 max-[1200px]:grid-cols-4 max-[758px]:grid-cols-3 max-[478px]:grid-cols-3 max-[478px]:gap-x-2"
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
              {producerName} Anime
            </h1>
            <p className='text-white text-lg max-[478px]:text-[16px]'>
              Couldn't get results, please try again
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-y-4">
            <h1 className="font-bold text-2xl text-white max-[478px]:text-[18px]">
              {producerName} Anime
            </h1>
            <p className='text-white text-lg max-[478px]:text-[16px]'>
              No results found
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Producer;
