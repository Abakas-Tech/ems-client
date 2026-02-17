import React, { useState } from "react";

function WorkerRegistration() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    title: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    about: "",
    facebook: "",
    twitter: "",
    googlePlus: "",
    linkedin: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Worker Data:", formData);
  };

  return (
    <section className="bg-light">
      <div className="container-fluid">
        <div className="row">
          <div className="col-lg-12 col-md-12">
            <div className="dashboard-wraper">
              {/* Worker Information */}
              <form className="form-submit" onSubmit={handleSubmit}>
                <h4>Worker Registration</h4>

                <div className="submit-section">
                  <div className="row">
                    <div className="form-group col-md-6">
                      <label>Your Name</label>
                      <input
                        type="text"
                        name="name"
                        className="form-control"
                        value={formData.name}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="form-group col-md-6">
                      <label>Email</label>
                      <input
                        type="email"
                        name="email"
                        className="form-control"
                        value={formData.email}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="form-group col-md-6">
                      <label>Your Title</label>
                      <input
                        type="text"
                        name="title"
                        className="form-control"
                        value={formData.title}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="form-group col-md-6">
                      <label>Phone</label>
                      <input
                        type="text"
                        name="phone"
                        className="form-control"
                        value={formData.phone}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="form-group col-md-6">
                      <label>Address</label>
                      <input
                        type="text"
                        name="address"
                        className="form-control"
                        value={formData.address}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="form-group col-md-6">
                      <label>City</label>
                      <input
                        type="text"
                        name="city"
                        className="form-control"
                        value={formData.city}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="form-group col-md-6">
                      <label>State</label>
                      <input
                        type="text"
                        name="state"
                        className="form-control"
                        value={formData.state}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="form-group col-md-6">
                      <label>Zip</label>
                      <input
                        type="text"
                        name="zip"
                        className="form-control"
                        value={formData.zip}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="form-group col-md-12">
                      <label>About</label>
                      <textarea
                        name="about"
                        className="form-control"
                        value={formData.about}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>

                {/* Social Accounts */}
                <h4 className="mt-4">Social Accounts</h4>

                <div className="submit-section">
                  <div className="row">
                    <div className="form-group col-md-6">
                      <label>Facebook</label>
                      <input
                        type="text"
                        name="facebook"
                        className="form-control"
                        value={formData.facebook}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="form-group col-md-6">
                      <label>Twitter</label>
                      <input
                        type="text"
                        name="twitter"
                        className="form-control"
                        value={formData.twitter}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="form-group col-md-6">
                      <label>Google Plus</label>
                      <input
                        type="text"
                        name="googlePlus"
                        className="form-control"
                        value={formData.googlePlus}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="form-group col-md-6">
                      <label>LinkedIn</label>
                      <input
                        type="text"
                        name="linkedin"
                        className="form-control"
                        value={formData.linkedin}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="form-group col-lg-12 col-md-12">
                      <button
                        className="btn btn-main px-5 rounded"
                        type="submit"
                      >
                        Register Worker
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default WorkerRegistration;
