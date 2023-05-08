import { CgChevronLeft, CgChevronRight } from 'react-icons/cg';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Button } from 'react-bootstrap';
import { services } from '../../../api/services';
import Rating from '@mui/material/Rating';

export default function Hint({ hintDefaultLevel, hints, exerciseId, ...props }) {
  const [hint, setHint] = useState(0);
  const [hintDetailLevel, setHintDetailLevel] = useState(0);
  const [rating, setRating] = useState(0);

  const handleRecommendationVisited = async (recommendationId) => {
    try {
      services.updateHintVisited(recommendationId);
    } catch (error) {
      console.log('failed to update visited');
    }
  };

  // const handleRecommendationRating = async (rating) => {
  //   try {
  //     const recommId = hints[hint].recommendationsAndRatings[hintDetailLevel].id;
  //     services.updateHintRating(recommId, rating);
  //   } catch (error) {
      
  //   }
  // };

  const handleChangeRating = (rating) => {
    try {
      hints[hint].recommendationsAndRatings[hintDetailLevel].rating = rating;
      const recommId = hints[hint].recommendationsAndRatings[hintDetailLevel].id
      services.updateHintRating(recommId, rating);
      setRating(rating);
    } catch (error) {
      console.log('failed to update rating');
    }
  };

  const handleChangeTier = (value) => {
    if (value >= 0 && value <= 2) {
      setHintDetailLevel(value);
      if (hints[hint].recommendationsAndRatings[value].rating === -1) setRating(0);
      else setRating(hints[hint].recommendationsAndRatings[value].rating);
      handleRecommendationVisited(hints[hint].recommendationsAndRatings[value].id);
    }
  };

  const handleChangeHint = (value) => {
    if (value >= 0 && value < hints.length) {
      setHint(value);
      setHintDetailLevel(hintDefaultLevel);
      if (hints[value].recommendationsAndRatings[hintDefaultLevel].rating === -1) setRating(0);
      else setRating(hints[value].recommendationsAndRatings[hintDefaultLevel].rating);
      handleRecommendationVisited(hints[value].recommendationsAndRatings[hintDefaultLevel].id);
    }
  };

  useEffect(() => {
    setHintDetailLevel(hintDefaultLevel);
    setHint(0);
    setRating(0);
  }, [hints]);

  return hints?.length > 0 ? (
    <div className="w-100 border rounded d-flex" style={{ flex: 1, height: '40vh' }}>
      <motion.div
        whileHover={{ background: hint > 0 ? '#f0f1f4' : '#fff' }}
        animate={{ background: '#ffffff' }}
        onClick={() => handleChangeHint(hint - 1)}
        className="clickable d-flex justify-content-center align-items-center px-1 user-select-none"
      >
        <CgChevronLeft size={20} style={{ opacity: hint > 0 ? 1 : 0 }} />
      </motion.div>
      <div className="d-flex flex-column" style={{ flex: 1, justifyContent: 'space-between', maxHeight: '100%' }}>
        <div className="pt-2" style={{ color: '#909498', fontWeight: 500, borderBottom: '1px solid black' }}>
          HINT {hint + 1} - {hints[hint].query_type}
        </div>
        <div
          className="pt-1"
          style={{
            flex: 1,
            whiteSpace: 'pre-line',
            overflow: 'auto',
            overscrollBehavior: 'contain',
            fontSize: '0.8em',
          }}
        >
          {/* {console.log(hints[hint].recommendationsAndRatings[hintDetailLevel].recommendation)} */}
          {hints[hint].recommendationsAndRatings[hintDetailLevel]?.recommendation}
        </div>
        <div className="d-flex justify-content-center pt-2 pb-2">
          <Button
            className="mx-1"
            disabled={hintDetailLevel === 0 || hints[hint].query_type === 'GENERAL'}
            onClick={() => handleChangeTier(hintDetailLevel - 1)}
            style={{ width: 100, fontSize: 12, background: '#222730', border: 'none' }}
          >
            See less
          </Button>
          <Button
            className="mx-1"
            disabled={hintDetailLevel === 2 || hints[hint].query_type === 'GENERAL'}
            onClick={() => handleChangeTier(hintDetailLevel + 1)}
            style={{ width: 100, fontSize: 12, background: '#222730', border: 'none' }}
          >
            See more
          </Button>
        </div>
        <div className="d-flex justify-content-center pt-2 pb-2">
          <div>Please rate this recommendation:</div>
          <Rating
            name="simple-controlled"
            value={rating}
            onChange={(event, newRating) => {
              handleChangeRating(newRating);
            }}
          />
        </div>
      </div>
      <motion.div
        whileHover={{ background: hint < hints?.length - 1 ? '#f0f1f4' : '#fff' }}
        animate={{ background: '#ffffff' }}
        onClick={() => handleChangeHint(hint + 1)}
        className="clickable d-flex justify-content-center align-items-center px-1 user-select-none"
      >
        <CgChevronRight size={20} style={{ opacity: hint < hints?.length - 1 ? 1 : 0 }} />
      </motion.div>
    </div>
  ) : (
    <div
      className="border rounded w-100 d-flex align-items-center justify-content-center flex-column"
      style={{ height: '20vh' }}
    >
      {hints?.length === 0 ? <div>No hints to show</div> : <div>Need some help? Click 'Get hints'</div>}
    </div>
  );
  // <div className="border rounded" style={{ flex: 1, display: 'flex', fontSize: '0.8em' }}>
  // </div>
}
