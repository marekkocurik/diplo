import { CgChevronLeft, CgChevronRight } from 'react-icons/cg';
import { VscCircleFilled } from 'react-icons/vsc';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Button } from 'react-bootstrap';
import { services } from '../../../api/services';

export default function Hint({ exerciseId, userQuery, ...props }) {
  const [hint, setHint] = useState(0);
  const [hints, setHints] = useState([0, 1, 2, 3, 4, 5, 6]);
  const [tier, setTier] = useState(0);
  const [active, setActive] = useState(false);

  const handleChangeTier = (value) => {
    value >= 0 && value <= 2 && setTier(value);
  };

  const handleChangeHint = (value) => {
    value >= 0 && setHint(value);
  };

  const handleGivingHelp = async (e) => {
    e.preventDefault();
    try {
      let result = await services.getHelp(userQuery, exerciseId);
      setActive(true);
    } catch (error) {
      const { message } = await error.response.json();
      // setModalErrorMessage('Please fix the following errors first:\n\n' + message);
      // setShowModal(true);
    }
  };

  useEffect(() => {
    setActive(false);
    setHint(0);
  }, [exerciseId]);

  return (
    <div style={{ flex: 1, display: 'flex' }} className="hint">
      {/* <div className="m-1">
        {[0, 1, 2, 3].map((i) => (
          <motion.div
            animate={{ background: hint === i ? '#222730' : '#ffffff', color: hint === i ? '#ffffff' : '#222' }}
            style={{ width: 40, height: 40 }}
            onClick={() => setHint(i)}
            className="mb-1 clickable d-flex justify-content-center align-items-center border rounded"
          >
            {i + 1}
          </motion.div>
        ))}
      </div> */}
      <div className="m-1 border rounded overflow-hidden" style={{ flex: 1, height: 300 }}>
        {active && (
          <div className="d-flex" style={{ flex: 1 }}>
            <motion.div
              whileHover={{ background: hint > 0 ? '#f0f1f4' : '#fff' }}
              animate={{ background: '#ffffff' }}
              onClick={() => handleChangeHint(hint - 1)}
              className="clickable d-flex justify-content-center align-items-center px-1 user-select-none"
            >
              <CgChevronLeft size={30} style={{ opacity: hint > 0 ? 1 : 0 }} />
            </motion.div>
            <div className="d-flex flex-column" style={{ flex: 1 }}>
              <div className="p-4 pt-5" style={{ flex: 1 }}>
                <span style={{ color: '#909498', fontWeight: 500, fontSize: 12 }}>HINT {hint + 1}</span>
                <h5 style={{ fontWeight: 600 }}>LEVEL {tier + 1}</h5>
                Lorem ipsum, dolor sit amet consectetur adipisicing elit. Id ducimus aliquid eum pariatur quibusdam
                repellendus et animi obcaecati explicabo cupiditate ratione quam ipsum, libero magnam alias mollitia
                asperiores dolorem quidem.
              </div>
              <div className="d-flex justify-content-center py-3">
                {/* {[0, 1, 2].map((i) => (
              <VscCircleFilled
                className="clickable"
                onClick={() => setTier(i)}
                style={{ opacity: tier >= i ? 1 : 0.3 }}
              />
            ))} */}
                <Button
                  className="mx-1"
                  disabled={tier === 0}
                  onClick={() => handleChangeTier(tier - 1)}
                  style={{ width: 100, fontSize: 12, background: '#222730', border: 'none' }}
                >
                  See less
                </Button>
                <Button
                  className="mx-1"
                  disabled={tier === 2}
                  onClick={() => handleChangeTier(tier + 1)}
                  style={{ width: 100, fontSize: 12, background: '#222730', border: 'none' }}
                >
                  See more
                </Button>
              </div>
            </div>
            <motion.div
              whileHover={{ background: hint < hints?.length ? '#f0f1f4' : '#fff' }}
              animate={{ background: '#ffffff' }}
              onClick={() => handleChangeHint(hint + 1)}
              className="clickable d-flex justify-content-center align-items-center px-1 user-select-none"
            >
              <CgChevronRight size={30} style={{ opacity: hint < hints?.length ? 1 : 0 }} />
            </motion.div>
          </div>
        )}

        {!active && (
          <div className="w-100 h-100 d-flex align-items-center justify-content-center flex-column">
            <span>Need some help?</span>
            <span className="clickable" style={{ textDecoration: 'underline' }} onClick={handleGivingHelp/*setActive(true)*/}>
              Click here
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
