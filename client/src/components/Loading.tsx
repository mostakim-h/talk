import svgLoading from '../assets/loading.svg';

export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <img src={svgLoading} alt={'loading'} width={100}/>
    </div>
  );
}