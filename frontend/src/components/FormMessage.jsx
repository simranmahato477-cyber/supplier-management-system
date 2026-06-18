const FormMessage = ({ error, success }) => {
  if (!error && !success) return null;
  return <div className={error ? 'message error' : 'message success'}>{error || success}</div>;
};

export default FormMessage;
