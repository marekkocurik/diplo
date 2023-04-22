import { React, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { services } from '../../../api/services';
import { Button, Form } from 'react-bootstrap';
import Modal from 'react-bootstrap/Modal';
import Schema from './Schema';
import Result from './Result';
import History from './History';
import Solutions from './Solutions';
import Tab from 'react-bootstrap/Tab';
import Nav from 'react-bootstrap/Nav';

export default function Exercise({ exerciseTree, setExerciseTree, ...props }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [exercise, setExercise] = useState(null);
  const [nextExerciseExists, setNextExerciseExists] = useState(false);
  const [nextExerciseID, setNextExerciseID] = useState(null);
  const [nextChapterID, setNextChapterID] = useState(null);
  const [previousExerciseExists, setPreviousExerciseExists] = useState(false);
  const [previousExerciseID, setPreviousExerciseID] = useState(null);
  const [previousChapterID, setPreviousChapterID] = useState(null);

  const [historyInitialized, setHistoryInitialized] = useState(false);
  const [solutionsInitialized, setSolutionsInitialized] = useState(false);
  const [expectedResultInitialized, setExpectedResultInitialized] = useState('initialize');
  const [selectedKey, setSelectedKey] = useState('hist');
  const [userQuery, setUserQuery] = useState('');
  const [action, setAction] = useState('reset');
  const [history, setHistory] = useState([]);
  const [solutions, setSolutions] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [modalErrorMessage, setModalErrorMessage] = useState('');

  //Result variables:
  // const [expectedQueryResult, setExpectedQueryResult] = useState([]);
  // const [userQueryResult, setUserQueryResult] = useState([]);
  // const [expectedQueryErrorMessage, setExpectedQueryErrorMessage] = useState(null);
  // const [userQueryErrorMessage, setUserQueryErrorMessage] = useState(null);

  const checkNextAvailableExercise = (c_id, e_id, inc) => {
    const c_index = exerciseTree.findIndex((chapter) => chapter.id === c_id);
    if (c_index !== undefined) {
      const exercises = exerciseTree[c_index].exercises;
      const e_index = exercises.findIndex((e) => e.id === e_id);

      const next_e_index = e_index + inc;
      if (next_e_index >= exercises.length || next_e_index < 0) {
        const next_c_index = c_index + inc;
        if (next_c_index >= exerciseTree.length || next_c_index < 0) return [-1, -1];
        if (inc === 1) return [exerciseTree[next_c_index].id, exerciseTree[next_c_index].exercises[0].id];
        const len = exerciseTree[next_c_index].exercises.length;
        return [exerciseTree[next_c_index].id, exerciseTree[next_c_index].exercises[len - 1].id];
      }
      return [c_id, exercises[next_e_index].id];
    }
    return [-1, -1];
  };

  const initialize = async (chapterID, exerciseID) => {
    let [n_c_id, n_e_id] = checkNextAvailableExercise(chapterID, exerciseID, 1);
    let [p_c_id, p_e_id] = checkNextAvailableExercise(chapterID, exerciseID, -1);
    if (n_c_id !== -1) {
      setNextExerciseExists(true);
      setNextChapterID(n_c_id);
      setNextExerciseID(n_e_id);
    }
    if (p_c_id !== -1) {
      setPreviousExerciseExists(true);
      setPreviousChapterID(p_c_id);
      setPreviousExerciseID(p_e_id);
    }

    // document.getElementById('user_query').value = '';
    try {
      let exerciseInfo = await services.getExercise(exerciseID);
      setExercise(exerciseInfo);
    } catch (e) {
      console.log('Failed to get exercise.');
      const { message } = await e.response.json();
      console.log(message);
    }

    // setAction('initialize');
    setHistoryInitialized(false);
    setSolutionsInitialized(false);
    setSelectedKey('hist');

    //reset userQuery:
    setUserQuery('');
    setAction('reset');
    // console.log('restarting values')
    setExpectedResultInitialized('initialize');
    setHistory([]);
    setSolutions([]);

    //reset Result variables:
    // setExpectedQueryResult(exercise?.queryResult);
    // setUserQueryResult([]);
    // setExpectedQueryErrorMessage(null);
    // setUserQueryErrorMessage(null);
    // setResultInitialized(false);

    // setInitialized(true);
  };

  useEffect(() => {
    // setInitialized(false);
    if (searchParams.get('id') !== null) {
      let [chapterID, exerciseID] = searchParams.get('id').split('-');
      setShowModal(false);
      setModalErrorMessage('');
      initialize(parseInt(chapterID), parseInt(exerciseID));
    }
  }, [searchParams.get('id')]);

  const handleGivingHelp = async (e) => {
    e.preventDefault();
    try {
      let result = await services.getHelp(userQuery, exercise.id);
    } catch (error) {
      const { message } = await error.response.json();
      setModalErrorMessage('Please fix the following errors first:\n'+message);
      setShowModal(true);
    }
  };

  const handleCloseModal = () => setShowModal(false);

  const handleTestingQuery = async (e) => {
    e.preventDefault();
    if (action === 'test') setAction('test1');
    else setAction('test');
    // TODO: treba aktualizovat tabulku s historiou
  };

  const handleSubmittingQuery = async (e) => {
    e.preventDefault();
    if (action === 'submit') setAction('submit1');
    else setAction('submit');
    // TODO: ak je spravne query, treba aktualizovat tabulku s TOP solutions, leaderboard ...
  };

  const handleNextExercise = async (e) => {
    e.preventDefault();
    navigate(`/home/exercises?id=${nextChapterID}-${nextExerciseID}`);
  };

  const handlePreviousExercise = async (e) => {
    e.preventDefault();
    navigate(`/home/exercises?id=${previousChapterID}-${previousExerciseID}`);
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
          <div className="py-2" style={{ display: 'flex', flexDirection: 'row', width: '100%', maxHeight: '60vh' }}>
            <div style={{ width: '50%' }}>
              <Result
                table_name={'Expected result:'}
                action={expectedResultInitialized}
                setAction={setExpectedResultInitialized}
                // initialized={resultInitialized}
                // setInitialized={setResultInitialized}
                query={exercise.solution}
                // queryResult={expectedQueryResult}
                // setQueryResult={setExpectedQueryResult}
                // errorMessage={expectedQueryErrorMessage}
                // setErrorMessage={setExpectedQueryErrorMessage}
              />
            </div>
            <div style={{ width: '50%' }}>
              <Result
                table_name={'Your query result:'}
                action={action}
                setAction={setAction}
                query={userQuery}
                solution={exercise.solution}
                exerciseId={exercise.id}
                setHistory={setHistory}
                setHistoryInitialized={setHistoryInitialized}
                setSolutions={setSolutions}
                setSolutionsInitialized={setSolutionsInitialized}
                // action={action}
                // query={userQuery}
                // setAction={setAction}
                // solution={exercise?.solution}
                // exerciseId={exercise?.id}
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
                style={{ resize: 'vertical', minHeight: '100%', maxHeight: '100%' }}
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
                <Button style={{ width: '8vw', backgroundColor: '#2666CF' }} onClick={handleTestingQuery}>
                  Test
                </Button>
              </div>
              <div style={{ width: '100%' }}>
                <Button style={{ width: '8vw', backgroundColor: '#2666CF' }} onClick={handleSubmittingQuery}>
                  Submit
                </Button>
              </div>
            </div>
          </div>
          <div className="py-2 px-1" style={{ width: '100%', maxHeight: '40vh' }}>
            <Tab.Container
              id="left-tabs-example"
              defaultActiveKey="hist"
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
                  <History
                    exerciseId={exercise.id}
                    setUserQuery={setUserQuery}
                    // action={action}
                    // setAction={setAction}
                    history={history}
                    setHistory={setHistory}
                    historyInitialized={historyInitialized}
                    setHistoryInitialized={setHistoryInitialized}
                    exerciseTree={exerciseTree}
                    setExerciseTree={setExerciseTree}
                  />
                </Tab.Pane>
                <Tab.Pane eventKey="sol">
                  <Solutions
                    exerciseId={exercise.id}
                    setUserQuery={setUserQuery}
                    solutions={solutions}
                    setSolutions={setSolutions}
                    solutionsInitialized={solutionsInitialized}
                    setSolutionsInitialized={setSolutionsInitialized}
                  />
                </Tab.Pane>
              </Tab.Content>
            </Tab.Container>
          </div>
          <div className="py-3" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
            <div className="px-2">
              <Button
                style={{ width: '8vw', backgroundColor: '#2666CF' }}
                disabled={!previousExerciseExists}
                onClick={handlePreviousExercise}
              >
                {' '}
                {'< Previous'}
              </Button>
            </div>
            <div className="px-2">
              <Button
                style={{ width: '8vw', backgroundColor: '#2666CF' }}
                disabled={!nextExerciseExists}
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
