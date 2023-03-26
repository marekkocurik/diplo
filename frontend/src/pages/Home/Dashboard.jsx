export default function Dashboard({ ...props }) {
  return (
    <div className="w-100 h-100 p-3 d-flex justify-content-start align-items-center flex-column">
      <h1>Welcome</h1>
      <h5 className="my-3">I would like to thank you in the first place. Your help is much appreciated!</h5>
      <div className="w-100 h-100 d-flex justify-content-start align-items-start flex-column">
        <h5 className="my-3">Before you begin, please read the following information:</h5>
        <div>
          <ol>
            <li>
              <u>Reset password via email is not possible yet.</u> In case you forget your password, please send me an
              email to{' '}
              <i>
                <b>marek.kocurik02@gmail.com</b>
              </i>
              .
            </li>
            <li>
              If possible, try to solve exercises in random order. It would help me get data for various exercises and
              better feedback overall.
            </li>
            <li>
              In case you would like to give feedback / report bug, please, follow{' '}
              <a href="/home/report-bug" style={{ color: '#2666CF' }}>
                this link
              </a>{' '}
              (or click the icon next to your name in the upper right corner).
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}
