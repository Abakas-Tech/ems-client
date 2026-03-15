// import cityImg from "../../../../assets/img copy/side-city-1.png";
import { useEffect, useState } from "react";

function HeroBanner() {
  const cities = [
    "California",
    "Denver",
    "Las Vegas",
    "San Antonio",
    "San Francisco",
    "Los Angeles",
    "New Orleans",
    "San Diego",
  ];

  const [cityIndex, setCityIndex] = useState(0);
  const [text, setText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentCity = cities[cityIndex];
    const speed = 100;

    const type = () => {
      if (!isDeleting) {
        const nextText = currentCity.slice(0, text.length + 1);
        setText(nextText);

        if (nextText === currentCity) {
          setTimeout(() => setIsDeleting(true), 1000);
        }
      } else {
        const nextText = currentCity.slice(0, text.length - 1);
        setText(nextText);

        if (nextText === "") {
          setIsDeleting(false);
          setCityIndex((prev) => (prev + 1) % cities.length);
        }
      }
    };

    const timer = setTimeout(type, speed);
    return () => clearTimeout(timer);
  }, [text, isDeleting, cityIndex]);
  return (
    <div className="light-bg hero-banner">
      <div className="container">
        <div className="row align-items-center">
          <div className="col-xl-7 col-lg-7 col-md-12 col-sm-12">
            <div className="d-flex align-items-center justify-content-start mb-2">
              <div className="label rounded-pill bg-white text-dark d-flex align-items-center justify-content-center px-2 py-2 pe-3">
                <span className="label bg-green rounded-pill text-uppercase me-2">
                  New
                </span>
                Get 20% Off with Super Agent
              </div>
            </div>

            <h2>
              Find Your Dream House
              <br />
              {/* In <span className="text-primary">{text}|</span> */}
            </h2>

            <div className="full-search-2 hero-search-radius mt-5">
              <div className="hero-search-content">
                <div className="row">
                  <div className="col-xl-9 col-lg-8 col-md-8 col-sm-12">
                    <div className="form-group border-start borders">
                      <div className="position-relative">
                        <input
                          type="text"
                          className="form-control border-0 ps-5"
                          placeholder="Search for a location"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="col-xl-3 col-lg-4 col-md-4 col-sm-12">
                    <div className="form-group">
                      <button type="button" className="btn btn-dark full-width">
                        Learn More
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="searches-lists mt-4">
              <ul>
                <li>
                  <span>Popular Searches:</span>
                </li>
                <li>
                  <a href="#">2 BHK</a>
                </li>
                <li>
                  <a href="#" className="active">
                    Banglaw
                  </a>
                </li>
                <li>
                  <a href="#">Apartment</a>
                </li>
                <li>
                  <a href="#">London</a>
                </li>
                <li>
                  <a href="#">Villa</a>
                </li>
              </ul>
            </div>
          </div>

          <div className="col-xl-5 col-lg-5 col-md-12 col-sm-12">
            {/* <img src={cityImg} className="img-fluid" alt="City" /> */}
          </div>
        </div>
      </div>
    </div>
  );
}

export default HeroBanner;
