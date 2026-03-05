import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import ListingComponent from "../../../../shared/components/ListingComponent/ListingComponent";
import {
  assignWorkerSkill,
  getWorkerSkills,
  deleteWorkerSkill,
  addWorkerLanguage,
  getWorkerLanguages,
  updateWorkerLanguage,
  deleteWorkerLanguage,
  addWorkerPosition,
  getWorkerPositions,
  updateWorkerPosition,
  deleteWorkerPosition,
  addWorkerExperience,
  getWorkerExperiences,
  deleteWorkerExperience,
} from "../../api/workerMeta";
import {
  getSkills,
  getLanguages,
  getJobPositions,
  getCountries,
} from "../../api/meta.api";
import useLoader from "../../../../context/Loader/useLoader";
import useResponse from "../../../../context/Response/useResponse";
import { useDelete } from "../../../../context/Delete/useDelete";
import CreateMetaModal from "../meta/CreateMetaModal/CreateMetaModal";
// Validation for selecting skill
const validateSkill = (skill_id) => {
  if (!skill_id) return "Skill is required";
  return null;
};
const WorkerMeta = () => {
  const { worker_id } = useParams();
  const { showLoader, hideLoader } = useLoader();
  const { addMessage } = useResponse();
  const { openModal } = useDelete();
  const [skills, setSkills] = useState([]);
  const [allSkills, setAllSkills] = useState([]);
  const [showCreateSkillModal, setShowCreateSkillModal] = useState(false);
  const [languages, setLanguages] = useState([]);
  const [allLanguages, setAllLanguages] = useState([]);
  const [showCreateLanguageModal, setShowCreateLanguageModal] = useState(false);
  const [showUpdateLanguageModal, setShowUpdateLanguageModal] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [positions, setPositions] = useState([]);
  const [allPositions, setAllPositions] = useState([]);
  const [showCreatePositionModal, setShowCreatePositionModal] = useState(false);
  const [showUpdatePositionModal, setShowUpdatePositionModal] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState(null);
  // State for Worker Experiences
  const [experiences, setExperiences] = useState([]);
  const [allCountries, setAllCountries] = useState([]);
  const [allJobPositions, setAllJobPositions] = useState([]);
  const [showCreateExperienceModal, setShowCreateExperienceModal] =
    useState(false);

  const proficiencyOptions = [
    { value: "poor", label: "Poor" },
    { value: "basic", label: "Basic" },
    { value: "good", label: "Good" },
    { value: "fluent", label: "Fluent" },
    { value: "native", label: "Native" },
  ];

  // Fetch assigned experiences
  const fetchWorkerExperiences = async () => {
    showLoader();
    try {
      const response = await getWorkerExperiences(worker_id);
      setExperiences(response?.data || []);
    } catch (err) {
      addMessage(false, err.message);
    } finally {
      hideLoader();
    }
  };

  // Fetch all countries
  const fetchAllCountries = async () => {
    try {
      const response = await getCountries({ page: 1, limit: 100 });
      setAllCountries(response?.data || []);
    } catch (err) {
      addMessage(false, err.message);
    }
  };
  // Fetch all job positions
  const fetchAllJobPositions = async () => {
    try {
      const response = await getJobPositions({ page: 1, limit: 100 });
      setAllJobPositions(response?.data || []);
    } catch (err) {
      addMessage(false, err.message);
    }
  };
  // Fetch assigned skills
  const fetchWorkerSkills = async () => {
    showLoader();
    try {
      const response = await getWorkerSkills(worker_id);
      setSkills(response?.data || []);
    } catch (err) {
      addMessage(false, err.message);
    } finally {
      hideLoader();
    }
  };
  // Fetch all skills for dropdown
  const fetchAllSkills = async () => {
    try {
      const response = await getSkills({ page: 1, limit: 100 });
      setAllSkills(response?.data || []);
    } catch (err) {
      addMessage(false, err.message);
    }
  };
  // Fetch assigned languages
  const fetchWorkerLanguages = async () => {
    showLoader();
    try {
      const response = await getWorkerLanguages(worker_id);
      setLanguages(response?.data || []);
    } catch (err) {
      addMessage(false, err.message);
    } finally {
      hideLoader();
    }
  };
  // Fetch all languages for dropdown
  const fetchAllLanguages = async () => {
    try {
      const response = await getLanguages({ page: 1, limit: 100 });
      setAllLanguages(response?.data || []);
    } catch (err) {
      addMessage(false, err.message);
    }
  };
  // Fetch assigned positions
  const fetchWorkerPositions = async () => {
    showLoader();
    try {
      const response = await getWorkerPositions(worker_id);
      setPositions(response?.data || []);
    } catch (err) {
      addMessage(false, err.message);
    } finally {
      hideLoader();
    }
  };
  // Fetch all positions for dropdown
  const fetchAllPositions = async () => {
    try {
      const response = await getJobPositions({ page: 1, limit: 100 });
      setAllPositions(response?.data || []);
    } catch (err) {
      addMessage(false, err.message);
    }
  };
  useEffect(() => {
    fetchAllCountries();
    fetchAllJobPositions();
    fetchWorkerExperiences();
    fetchWorkerSkills();
    fetchAllSkills();
    fetchWorkerLanguages();
    fetchAllLanguages();
    fetchWorkerPositions();
    fetchAllPositions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [worker_id]);

  // Validator for Worker Experience
  const validateExperience = ({
    country_id,
    job_position_id,
    years_of_experience,
  }) => {
    if (!country_id) return "Country is required";
    if (!job_position_id) return "Job position is required";

    const years = Number(years_of_experience);
    if (isNaN(years) || years < 0 || !Number.isInteger(years)) {
      return "Years of experience must be a non-negative integer";
    }

    return null; // valid
  };

  // Handle add experience
  const handleAddExperience = async (inputValues) => {
    const error = validateExperience(inputValues);
    if (error) {
      addMessage(false, error);
      return;
    }

    const { country_id, job_position_id, years_of_experience } = inputValues;

    showLoader();
    try {
      const response = await addWorkerExperience(worker_id, {
        country_id,
        job_position_id,
        years_of_experience: Number(years_of_experience),
      });
      addMessage(response?.success, response?.message);
      setShowCreateExperienceModal(false);
      fetchWorkerExperiences();
    } catch (err) {
      addMessage(false, err.message);
    } finally {
      hideLoader();
    }
  };

  // Handle delete experience
  const handleDeleteExperience = (row) => {
    openModal(async () => {
      showLoader();
      try {
        const response = await deleteWorkerExperience(
          worker_id,
          row.country_id,
        );
        addMessage(response?.success, response?.message);
        fetchWorkerExperiences();
      } catch (err) {
        addMessage(false, err.message);
      } finally {
        hideLoader();
      }
    });
  };

  // Handle assigning skill
  const handleAssignSkill = async (inputValues) => {
    const skill_id = inputValues.skill_id;
    const error = validateSkill(skill_id);
    if (error) {
      addMessage(false, error);
      return;
    }
    showLoader();
    try {
      const response = await assignWorkerSkill(
        worker_id, // query params
        { skill_id }, // body
      );
      addMessage(response?.success, response?.message);
      setShowCreateSkillModal(false);
      fetchWorkerSkills();
    } catch (err) {
      addMessage(false, err.message);
    } finally {
      hideLoader();
    }
  };
  // Handle delete skill
  const handleDeleteSkill = (row) => {
    openModal(async () => {
      showLoader();
      try {
        const response = await deleteWorkerSkill(worker_id, row.id);
        addMessage(response?.success, response?.message);
        fetchWorkerSkills();
      } catch (err) {
        addMessage(false, err.message);
      } finally {
        hideLoader();
      }
    });
  };
  // Handle add language
  const handleAddLanguage = async (inputValues) => {
    const { language_id, proficiency } = inputValues;
    if (!language_id) {
      addMessage(false, "Language is required");
      return;
    }
    if (!proficiency) {
      addMessage(false, "Proficiency is required");
      return;
    }
    showLoader();
    try {
      const response = await addWorkerLanguage(worker_id, {
        language_id,
        proficiency,
      });
      addMessage(response?.success, response?.message);
      setShowCreateLanguageModal(false);
      fetchWorkerLanguages();
    } catch (err) {
      addMessage(false, err.message);
    } finally {
      hideLoader();
    }
  };
  // Handle update language
  const handleUpdateLanguage = async (inputValues) => {
    const { proficiency } = inputValues;
    if (!proficiency) {
      addMessage(false, "Proficiency is required");
      return;
    }
    showLoader();
    try {
      const response = await updateWorkerLanguage(
        worker_id,
        selectedLanguage.id,
        { proficiency },
      );
      addMessage(response?.success, response?.message);
      setShowUpdateLanguageModal(false);
      setSelectedLanguage(null);
      fetchWorkerLanguages();
    } catch (err) {
      addMessage(false, err.message);
    } finally {
      hideLoader();
    }
  };
  // Handle edit language
  const handleEditLanguage = (row) => {
    setSelectedLanguage(row);
    setShowUpdateLanguageModal(true);
  };
  // Handle delete language
  const handleDeleteLanguage = (row) => {
    openModal(async () => {
      showLoader();
      try {
        const response = await deleteWorkerLanguage(worker_id, row.id);
        addMessage(response?.success, response?.message);
        fetchWorkerLanguages();
      } catch (err) {
        addMessage(false, err.message);
      } finally {
        hideLoader();
      }
    });
  };
  // Handle add position
  const handleAddPosition = async (inputValues) => {
    const { position_id, years_of_experience } = inputValues;
    if (!position_id) {
      addMessage(false, "Position is required");
      return;
    }
    const years = Number(years_of_experience);
    if (isNaN(years) || years < 0 || !Number.isInteger(years)) {
      addMessage(false, "Years of experience must be a non-negative integer");
      return;
    }
    showLoader();
    try {
      const response = await addWorkerPosition(worker_id, {
        position_id,
        years_of_experience: years,
      });
      addMessage(response?.success, response?.message);
      setShowCreatePositionModal(false);
      fetchWorkerPositions();
    } catch (err) {
      addMessage(false, err.message);
    } finally {
      hideLoader();
    }
  };
  // Handle update position
  const handleUpdatePosition = async (inputValues) => {
    const { years_of_experience } = inputValues;
    const years = Number(years_of_experience);
    if (isNaN(years) || years < 0 || !Number.isInteger(years)) {
      addMessage(false, "Years of experience must be a non-negative integer");
      return;
    }
    showLoader();
    try {
      const response = await updateWorkerPosition(
        worker_id,
        selectedPosition.id,
        { years_of_experience: years },
      );
      addMessage(response?.success, response?.message);
      setShowUpdatePositionModal(false);
      setSelectedPosition(null);
      fetchWorkerPositions();
    } catch (err) {
      addMessage(false, err.message);
    } finally {
      hideLoader();
    }
  };
  // Handle edit position
  const handleEditPosition = (row) => {
    setSelectedPosition(row);
    setShowUpdatePositionModal(true);
  };
  // Handle delete position
  const handleDeletePosition = (row) => {
    openModal(async () => {
      showLoader();
      try {
        const response = await deleteWorkerPosition(worker_id, row.id);
        addMessage(response?.success, response?.message);
        fetchWorkerPositions();
      } catch (err) {
        addMessage(false, err.message);
      } finally {
        hideLoader();
      }
    });
  };
  // Columns, actions, fields, and empty states for skills, languages, positions and experiences
  // Skills
  const columnsSkills = [
    {
      header: "Name",
      accessor: "name",
    },
  ];
  const actionsSkills = [{ type: "delete", onClick: handleDeleteSkill }];
  const fieldsSkills = [
    {
      name: "skill_id",
      label: "Skill",
      type: "select",
      options: allSkills.map((skill) => ({
        value: skill.id,
        label: skill.name,
      })),
    },
  ];
  const emptyStateSkills = {
    title: "No skills assigned",
  };
  // Languages
  const columnsLanguages = [
    {
      header: "Name",
      accessor: "name",
    },
    {
      header: "Proficiency",
      accessor: "level",
    },
  ];
  const actionsLanguages = [
    { type: "edit", onClick: handleEditLanguage },
    { type: "delete", onClick: handleDeleteLanguage },
  ];
  const fieldsAddLanguages = [
    {
      name: "language_id",
      label: "Language",
      type: "select",
      options: allLanguages.map((language) => ({
        value: language.id,
        label: language.name,
      })),
    },
    {
      name: "proficiency",
      label: "Proficiency",
      type: "select",
      options: proficiencyOptions,
    },
  ];
  const fieldsUpdateLanguages = [
    {
      name: "proficiency",
      label: "Proficiency",
      type: "select",
      options: proficiencyOptions,
    },
  ];
  const emptyStateLanguages = {
    title: "No languages assigned",
  };
  // Positions
  const columnsPositions = [
    {
      header: "Name",
      accessor: "name",
    },
    {
      header: "Experience",
      accessor: "years_of_experience",
    },
  ];
  const actionsPositions = [
    { type: "edit", onClick: handleEditPosition },
    { type: "delete", onClick: handleDeletePosition },
  ];
  const fieldsAddPositions = [
    {
      name: "position_id",
      label: "Position",
      type: "select",
      options: allPositions.map((position) => ({
        value: position.id,
        label: position.name,
      })),
    },
    {
      name: "years_of_experience",
      label: "Years of Experience",
      type: "number",
    },
  ];
  const fieldsUpdatePositions = [
    {
      name: "years_of_experience",
      label: "Years of Experience",
      type: "number",
    },
  ];
  const emptyStatePositions = {
    title: "No positions assigned",
  };

  // experiences
  const columnsExperiences = [
    { header: "Country", accessor: "country_name" },
    { header: "Position", accessor: "position_name" },
    { header: "Years ", accessor: "years_of_experience" },
  ];
  const actionsExperiences = [
    { type: "delete", onClick: handleDeleteExperience },
  ];
  const fieldsAddExperiences = [
    {
      name: "country_id",
      label: "Country",
      type: "select",
      options: allCountries.map((c) => ({ value: c.id, label: c.name })),
    },
    {
      name: "job_position_id",
      label: "Job Position",
      type: "select",
      options: allJobPositions.map((p) => ({ value: p.id, label: p.name })),
    },
    {
      name: "years_of_experience",
      label: "Years of Experience",
      type: "number",
    },
  ];
  const emptyStateExperiences = {
    title: "No experiences added",
  };

  return (
    <div className="dashboard-wraper">
      {/* Worker Meta Header (optional) */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
        {/* Title and description */}
        <div className="flex-grow-1">
          <h2 className="fw-bold text-dark mb-2">Worker Meta</h2>
          <p className="text-muted mb-0">
            Assign skills, languages, positions, and experiences to this worker.
          </p>
        </div>

        {/* Action buttons for all meta types */}
        <div className="d-flex flex-wrap gap-2 mt-3 mt-md-0">
          <button
            className="btn btn-main"
            onClick={() => setShowCreateSkillModal(true)}
          >
            + Skill
          </button>
          <button
            className="btn btn-main"
            onClick={() => setShowCreateLanguageModal(true)}
          >
            + Language
          </button>
          <button
            className="btn btn-main"
            onClick={() => setShowCreatePositionModal(true)}
          >
            + Position
          </button>
          <button
            className="btn btn-main"
            onClick={() => setShowCreateExperienceModal(true)}
          >
            + Experience
          </button>
        </div>
      </div>

      {/* Skills + Languages Section in a row on md+ screens */}
      <div className="row mb-5 g-4">
        {/* Skills */}
        <div className="col-12 col-md-6">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
            <div className="flex-grow-1">
              <h3 className="fw-bold text-dark mb-2">Skills</h3>
              <p className="text-muted mb-0">
                Assign or remove skills for this worker.
              </p>
            </div>
            {/* <button
              className="btn btn-main"
              onClick={() => setShowCreateSkillModal(true)}
            >
              + Skill
            </button> */}
          </div>
          <ListingComponent
            data={skills}
            columns={columnsSkills}
            actions={actionsSkills}
            emptyState={emptyStateSkills}
          />
          <CreateMetaModal
            show={showCreateSkillModal}
            onClose={() => setShowCreateSkillModal(false)}
            onCreate={handleAssignSkill}
            fields={fieldsSkills}
            title="Assign Skill"
          />
        </div>

        {/* Languages */}
        <div className="col-12 col-md-6">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
            <div className="flex-grow-1">
              <h3 className="fw-bold text-dark mb-2">Languages</h3>
              <p className="text-muted mb-0">
                Add, update, or remove languages for this worker.
              </p>
            </div>
            {/* <button
              className="btn btn-main"
              onClick={() => setShowCreateLanguageModal(true)}
            >
              + Language
            </button> */}
          </div>
          <ListingComponent
            data={languages}
            columns={columnsLanguages}
            actions={actionsLanguages}
            emptyState={emptyStateLanguages}
          />
          <CreateMetaModal
            show={showCreateLanguageModal}
            onClose={() => setShowCreateLanguageModal(false)}
            onCreate={handleAddLanguage}
            fields={fieldsAddLanguages}
            title="Add Language"
          />
          <CreateMetaModal
            show={showUpdateLanguageModal}
            onClose={() => {
              setShowUpdateLanguageModal(false);
              setSelectedLanguage(null);
            }}
            onCreate={handleUpdateLanguage}
            fields={fieldsUpdateLanguages}
            title="Update Language"
          />
        </div>
      </div>
      <div className="row mb-5 g-4">
        <div className="col-12 col-md-6">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
            <div className="flex-grow-1">
              <h3 className="fw-bold text-dark mb-2">Positions</h3>
              <p className="text-muted mb-0">
                Add, update, or remove positions for this worker.
              </p>
            </div>
            {/* <button
              className="btn btn-main"
              onClick={() => setShowCreatePositionModal(true)}
            >
              + Position
            </button> */}
          </div>
          <ListingComponent
            data={positions}
            columns={columnsPositions}
            actions={actionsPositions}
            emptyState={emptyStatePositions}
          />
          <CreateMetaModal
            show={showCreatePositionModal}
            onClose={() => setShowCreatePositionModal(false)}
            onCreate={handleAddPosition}
            fields={fieldsAddPositions}
            title="Add Position"
          />
          <CreateMetaModal
            show={showUpdatePositionModal}
            onClose={() => {
              setShowUpdatePositionModal(false);
              setSelectedPosition(null);
            }}
            onCreate={handleUpdatePosition}
            fields={fieldsUpdatePositions}
            title="Update Position"
          />
        </div>
        <div className="col-12 col-md-6">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
            <div className="flex-grow-1">
              <h3 className="fw-bold text-dark mb-2">Experiences</h3>
              <p className="text-muted mb-0">
                Add or remove previous work experiences for this worker.
              </p>
            </div>
            {/* <button
              className="btn btn-main"
              onClick={() => setShowCreateExperienceModal(true)}
            >
              + Experience
            </button> */}
          </div>
          <ListingComponent
            data={experiences}
            columns={columnsExperiences}
            actions={actionsExperiences}
            emptyState={emptyStateExperiences}
          />
          <CreateMetaModal
            show={showCreateExperienceModal}
            onClose={() => setShowCreateExperienceModal(false)}
            onCreate={handleAddExperience}
            fields={fieldsAddExperiences}
            title="Add Experience"
          />
        </div>
      </div>
    </div>
  );
};
export default WorkerMeta;
