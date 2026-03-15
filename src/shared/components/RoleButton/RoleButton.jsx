import useProfile from './../../../context/Profile/useProfile';
const RoleButton = ({ visibleTo = [], children, ...rest }) => {
  const { profile } = useProfile();
  const role = profile?.role_id;

  // If the user's role is not in the allowed list, don't render the button
  if (!visibleTo.includes(role)) return null;

  return <button {...rest}>{children}</button>;
};

export default RoleButton;
