import { Skeleton } from "../ui/Skeleton/Skeleton"

function VoiceActorlistLoader() {
    return (
        <div className="w-full h-fit grid grid-cols-2 gap-4 overflow-y-hidden max-sm:gap-2 max-md:h-[400px] max-md:flex max-md:flex-col">
            {[...Array(10)].map((_, index) => (
                <div key={index} className="h-[90px] p-4 rounded-md bg-[#444445] hover:bg-[#4f4f50] transition-colors">
                    <div className="flex h-full items-center gap-x-3">
                        <Skeleton className="w-[55px] h-[55px] rounded-full max-sm:w-[40px] max-sm:h-[40px]" />
                        <div className="flex flex-col gap-y-2">
                            <Skeleton className="h-[16px] w-[120px] rounded-md max-[300px]:w-[80px] max-[300px]:h-[14px]" />
                            <Skeleton className="h-[14px] w-[80px] rounded-md max-[300px]:w-[60px] max-[300px]:h-[12px]" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}

export default VoiceActorlistLoader