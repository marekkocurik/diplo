import schemaImg from '../../../images/schema.png';

export default function Schema({ ...props }) {
  return (
    //   <div id="exercise_schema" style={{ height: '15vh', backgroundColor: '#f0f0f0' }}>
    <div id="exercise_schema">
      <img src={schemaImg} alt="Database schema" /* style={{ maxWidth: '100%', maxHeight: '70%' }} */ />
    </div>
  );
}
