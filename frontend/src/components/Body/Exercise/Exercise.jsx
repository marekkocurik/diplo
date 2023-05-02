import { React, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { services } from '../../../api/services';
import { Button, Form, Modal } from 'react-bootstrap';
import Schema from './Schema';
import Result from './Result';
import History from './History';
import Solutions from './Solutions';
import Tab from 'react-bootstrap/Tab';
import Nav from 'react-bootstrap/Nav';
import { useDispatch, useSelector } from 'react-redux';
import { exerciseSelected, historyUpdated, solutionsUpdated } from '../../../store/slices/exerciseSlice';
import {
  selectActiveExercise,
  selectNextExerciseUrlString,
  selectPreviousExerciseUrlString,
} from '../../../store/selectors';

export default function Exercise({ ...props }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const nextExerciseUrlString = useSelector(selectNextExerciseUrlString);
  const previousExerciseUrlString = useSelector(selectPreviousExerciseUrlString);
  const exercise = useSelector(selectActiveExercise);

  const [selectedKey, setSelectedKey] = useState('hist');
  const [userQuery, setUserQuery] = useState('');

  const dispatch = useDispatch();

  const [userQueryResult, setUserQueryResult] = useState(null);
  const [expectedQueryResult, setExpectedQueryResult] = useState(null);
  const [userQueryErrorMsg, setUserQueryErrorMsg] = useState(null);
  const [expectedQueryErrorMsg, setExpectedQueryErrorMsg] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [modalErrorMessage, setModalErrorMessage] = useState('');

  const initialize = async (chapterID, exerciseID) => {
    try {
      let response = await services.getExercise(exerciseID);

      dispatch(
        exerciseSelected({
          exercise: response.exercise,
          chapter: chapterID,
        })
      );

      try {
        const queryResultResponse = await services.getQueryExpectedResult(response.exercise.solution);
        setExpectedQueryResult(queryResultResponse.queryResultInfo.queryResult);
        setExpectedQueryErrorMsg('');
      } catch (e) {
        const { message } = await e.response.json();
        setExpectedQueryErrorMsg(message);
      }
    } catch (e) {
      console.log('Failed to get exercise.');
      const { message } = await e.response.json();
      console.log(message);
    }

    setSelectedKey('hist');
    // setUserQuery('');
  };

  useEffect(() => {
    // setInitialized(false);
    if (searchParams.get('id') !== null) {
      let [chapterID, exerciseID] = searchParams.get('id').split('-');
      setShowModal(false);
      setModalErrorMessage('');
      setUserQueryResult(null);
      setUserQueryErrorMsg(null);
      initialize(parseInt(chapterID), parseInt(exerciseID));
    }
  }, [searchParams.get('id')]);

  const handleGivingHelp = async (e) => {
    e.preventDefault();
    try {
      let result = await services.getHelp(userQuery, exercise.id);
    } catch (error) {
      const { message } = await error.response.json();
      setModalErrorMessage('Please fix the following errors first:\n' + message);
      setShowModal(true);
    }
  };

  const handleCloseModal = () => setShowModal(false);

  const handleExecuteQuery =
    ({ test = false }) =>
    async (e) => {
      e.preventDefault();

      let apiCall = test ? services.getQueryTestResult : services.getQuerySubmitResult;
      let result;

      try {
        result = await apiCall(userQuery, exercise.solution, exercise.id);
        console.log('result for: ', userQuery);
        console.log(result.queryResultInfo);
        setUserQueryResult(result.queryResultInfo.queryResult);
        setUserQueryErrorMsg('');
      } catch (err) {
        console.log('Error caught')
        const { message } = await err.response.json();
        console.log('setting error message to: ', message);
        setUserQueryErrorMsg(message);
      }

      !(userQuery.trim().length === 0) && dispatch(
        historyUpdated({
          id: result === undefined ? -1 : result.queryResultInfo.id,
          submit_attempt: !test,
          query: userQuery,
          solution_success: result === undefined ? 'ERROR' : result.queryResultInfo.solutionSuccess,
          date: Date.now(),
        })
      );
      result?.queryResultInfo.solutionSuccess === 'COMPLETE' &&
        dispatch(
          solutionsUpdated({
            query: userQuery,
          })
        );
    };

  const handleNextExercise = async (e) => {
    e.preventDefault();
    navigate(`/home/exercises?id=${nextExerciseUrlString}`);
  };

  const handlePreviousExercise = async (e) => {
    e.preventDefault();
    navigate(`/home/exercises?id=${previousExerciseUrlString}`);
  };

  const handleUserQueryChange = (e) => {
    e.preventDefault();
    setUserQuery(e.target.value);
  };

  const handleSelect = (key) => {
    setSelectedKey(key);
  };

  return searchParams.get('id') === null ? (
    <div></div>
  ) : (
    <div style={{ height: '100%', width: '100%' }}>
      {exercise ? (
        <div
          style={{
            paddingLeft: '1vw',
            height: '100%',
            width: '100%',
            overflow: 'auto',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div className="pt-2" style={{ width: '100%' }}>
            <h2 dangerouslySetInnerHTML={{ __html: exercise.name }} />
          </div>
          <div className="pt-1" style={{ width: '100%' }}>
            <p dangerouslySetInnerHTML={{ __html: exercise.question }} />
          </div>
          <div style={{ width: '100%', maxHeight: '35vh' }}>
            <Schema />
          </div>
          <div className="py-2" style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', width: '100%' }}>
            <div style={{ flex: 1 }}>
              <Result
                table_name={'Expected result:'}
                queryResult={expectedQueryResult}
                errorMessage={expectedQueryErrorMsg}
              />
            </div>
            <div style={{ flex: 1 }}>
              <Result
                table_name={'Your query result:'}
                queryResult={userQueryResult}
                errorMessage={userQueryErrorMsg}
              />
            </div>
          </div>
          <div
            className="py-2 px-1"
            style={{ display: 'flex', flexDirection: 'row', width: '100%', maxHeight: '50vh' }}
          >
            <div style={{ width: '70%' }}>
              <Form.Control
                id="user_query"
                style={{ fontSize: '0.9em', resize: 'vertical', minHeight: '100%', maxHeight: '100%' }}
                as="textarea"
                placeholder="Write your answer here"
                value={userQuery}
                onChange={handleUserQueryChange}
              />
            </div>
            <div className="px-2" style={{ width: '10%', display: 'flex', flexDirection: 'column' }}>
              <div style={{ width: '100%' }}>
                <Button style={{ width: '8vw', backgroundColor: '#2666CF' }} onClick={handleGivingHelp}>
                  Help
                </Button>
              </div>
              <div className="py-1" style={{ width: '100%' }}>
                <Button
                  style={{ width: '8vw', backgroundColor: '#2666CF' }}
                  onClick={handleExecuteQuery({ test: true })}
                >
                  Test
                </Button>
              </div>
              <div style={{ width: '100%' }}>
                <Button style={{ width: '8vw', backgroundColor: '#2666CF' }} onClick={handleExecuteQuery({})}>
                  Submit
                </Button>
              </div>
            </div>
          </div>
          <div className="py-2 px-1" style={{ width: '100%', maxHeight: '40vh' }}>
            <Tab.Container
              id="left-tabs-example"
              defaultActiveKey="hist"
              key={exercise.id}
              // style={{ maxHeight: '100%', overflow: 'auto' }}
            >
              <Nav fill variant="tabs" activeKey={selectedKey} onSelect={handleSelect}>
                <Nav.Item>
                  <Nav.Link
                    eventKey="hist"
                    style={{
                      opacity: selectedKey === 'hist' ? 1 : 0.55,
                      backgroundColor: '#2666CF',
                      color: 'white',
                    }}
                  >
                    History
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link
                    eventKey="sol"
                    style={{
                      opacity: selectedKey === 'sol' ? 1 : 0.55,
                      backgroundColor: '#2666CF',
                      color: 'white',
                    }}
                  >
                    Solutions
                  </Nav.Link>
                </Nav.Item>
              </Nav>
              <Tab.Content style={{ maxHeight: '80%', overflow: 'auto' }}>
                <Tab.Pane eventKey="hist" style={{ overflow: 'auto' }}>
                  <History exerciseId={exercise.id} setUserQuery={setUserQuery} />
                </Tab.Pane>
                <Tab.Pane eventKey="sol">
                  <Solutions exerciseId={exercise.id} setUserQuery={setUserQuery} />
                </Tab.Pane>
              </Tab.Content>
            </Tab.Container>
          </div>
          <div className="py-3" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
            <div className="px-2">
              <Button
                style={{ width: '8vw', backgroundColor: '#2666CF' }}
                disabled={!previousExerciseUrlString}
                onClick={handlePreviousExercise}
              >
                {' '}
                {'< Previous'}
              </Button>
            </div>
            <div className="px-2">
              <Button
                style={{ width: '8vw', backgroundColor: '#2666CF' }}
                disabled={!nextExerciseUrlString}
                onClick={handleNextExercise}
              >
                {'Next >'}
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="loading-content">Loading exercise ...</div>
      )}

      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Body>{modalErrorMessage}</Modal.Body>
      </Modal>
    </div>
  );
}
