import schemaImg from '../../../images/schema.png';

export default function Schema({ ...props }) {
  return (
    <div id="exercise_schema" style={{ width: '100%', height: '100%' }}>
      <img src={schemaImg} alt="Database schema" style={{ maxWidth: '70%', maxHeight: '100%' }} />
    </div>
  );
}
