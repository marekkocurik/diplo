import { React, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { services } from '../../../api/services';
import { Button, Col, Form, Modal, Row } from 'react-bootstrap';
import Schema from './Schema';
import Result from './Result';
import History from './History';
import Solutions from './Solutions';
import Tab from 'react-bootstrap/Tab';
import Nav from 'react-bootstrap/Nav';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { exerciseSelected, historyUpdated, solutionsUpdated } from '../../../store/slices/exerciseSlice';
import {
  selectActiveExercise,
  selectNextExerciseUrlString,
  selectPreviousExerciseUrlString,
} from '../../../store/selectors';
import Hint from './Hint';

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

  const [hintDefaultLevel, setHintDefaultLevel] = useState(null);
  const [hints, setHints] = useState(null);

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
      setHintDefaultLevel(null);
      setHints(null);
      initialize(parseInt(chapterID), parseInt(exerciseID));
    }
  }, [searchParams.get('id')]);

  const handleCloseModal = () => setShowModal(false);

  const handleExecuteQuery =
    ({ test = false }) =>
    async (e) => {
      e.preventDefault();

      let apiCall = test ? services.getQueryTestResult : services.getQuerySubmitResult;
      let result;

      try {
        result = await apiCall(userQuery, exercise.solution, exercise.id);
        setUserQueryResult(result.queryResultInfo.queryResult);
        setUserQueryErrorMsg('');
      } catch (err) {
        const { message } = await err.response.json();
        setUserQueryErrorMsg(message);
      }

      !(userQuery.trim().length === 0) &&
        dispatch(
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

  const handleGivingHelp = async (e) => {
    e.preventDefault();
    try {
      let result = await services.getHelp(userQuery, exercise.id);
      setHintDefaultLevel(result.recs.default_detail_level);
      setHints(result.recs.recommendations);
    } catch (error) {
      const { message } = await error.response.json();
      setModalErrorMessage('Please fix the following errors first:\n\n' + message);
      setShowModal(true);
    }
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
          <div className="pt-2 px-1" style={{ width: '100%' }}>
            <h2 dangerouslySetInnerHTML={{ __html: exercise.name }} />
          </div>
          <div className="pt-1 px-1" style={{ width: '100%' }}>
            <p dangerouslySetInnerHTML={{ __html: exercise.question }} />
          </div>
          <div style={{ width: '100%', maxHeight: '30vh' }}>
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
          <div className="py-2 px-1 w-100 d-flex">
            <div className="p-1" style={{ flex: 3, display: 'flex', flexDirection: 'column' }}>
              <Form.Control
                id="user_query"
                rows="5"
                style={{ resize: 'vertical', fontSize: '0.8em' }}
                as="textarea"
                placeholder="Write your answer here"
                value={userQuery}
                onChange={handleUserQueryChange}
              />
              <div className="d-flex">
                <Button
                  className="m-1"
                  style={{ flex: 1, backgroundColor: '#2666CF' }}
                  onClick={handleExecuteQuery({ test: true })}
                >
                  Test
                </Button>
                <Button
                  className="m-1"
                  style={{ flex: 1, backgroundColor: '#2666CF' }}
                  onClick={handleExecuteQuery({})}
                >
                  Submit
                </Button>
                <Button className="m-1" style={{ flex: 1, backgroundColor: '#2666CF' }} onClick={handleGivingHelp}>
                  {hints ? 'Refresh hints' : 'Get hints'}
                </Button>
              </div>
            </div>

            <div className="p-1" style={{ flex: 2 }}>
              <Hint hintDefaultLevel={hintDefaultLevel} hints={hints} exerciseId={exercise.id} />
            </div>
          </div>
          <div className="py-2 px-1 w-100" style={{ maxHeight: '40vh', marginTop: 100 }}>
            <Tab.Container
              id="left-tabs-example"
              defaultActiveKey="hist"
              key={exercise.id}
              // style={{ maxHeight: '100%', overflow: 'auto' }}
            >
              <div className="w-100 d-flex">
                <div className="px-2" style={{ width: 150 }}>
                  <Nav variant="pills" className="flex-column" activeKey={selectedKey} onSelect={handleSelect}>
                    <Nav.Item>
                      <Nav.Link
                        eventKey="hist"
                        style={{
                          transition: 'none',
                          // opacity: selectedKey === 'hist' ? 1 : 0.7,
                          backgroundColor: selectedKey === 'hist' ? '#2666CF' : 'white',
                          color: selectedKey === 'hist' ? 'white' : '#2666CF',
                        }}
                      >
                        History
                      </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                      <Nav.Link
                        eventKey="sol"
                        style={{
                          transition: 'none',
                          // opacity: selectedKey === 'sol' ? 1 : 0.7,
                          backgroundColor: selectedKey === 'sol' ? '#2666CF' : 'white',
                          color: selectedKey === 'sol' ? 'white' : '#2666CF',
                        }}
                      >
                        Solutions
                      </Nav.Link>
                    </Nav.Item>
                  </Nav>
                </div>
                <div style={{ flex: 1 }}>
                  <Tab.Content style={{ overflow: 'auto', minHeight: '20vh' }}>
                    <Tab.Pane eventKey="hist" style={{ overflow: 'auto' }}>
                      <History exerciseId={exercise.id} setUserQuery={setUserQuery} />
                    </Tab.Pane>
                    <Tab.Pane eventKey="sol">
                      <Solutions exerciseId={exercise.id} setUserQuery={setUserQuery} />
                    </Tab.Pane>
                  </Tab.Content>
                </div>
              </div>
            </Tab.Container>
          </div>
          <div className="py-3" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
            <div className="px-2">
              <Button
                style={{ width: 150, backgroundColor: '#2666CF' }}
                disabled={!previousExerciseUrlString}
                onClick={handlePreviousExercise}
              >
                {'< Previous'}
              </Button>
            </div>
            <div className="px-2">
              <Button
                style={{ width: 150, backgroundColor: '#2666CF' }}
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
