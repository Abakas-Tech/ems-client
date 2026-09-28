import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import errorImage from "../../../assets/img/404/not-found.png";
import SEOHelmet from "../SEOHelmet/SEOHelmet";

const NotFound = () => {
  const { t, i18n } = useTranslation();

  return (
  <>
    <SEOHelmet />

      <div className="container mt-5" dir={i18n.dir()}>
        <div className="row justify-content-center">
          <div className="col-lg-6 col-md-10">
            <div className="text-center">
              <img src={errorImage} className="img-fluid" alt="" />
              <p>{t("notFound.message")}</p>
              <Link className="btn btn-main px-5" to="/">
                {t("notFound.backHome")}
              </Link>
            </div>
          </div>
        </div>
      </div>

  </>
  );
};

export default NotFound;
