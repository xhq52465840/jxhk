package com.usky.sms.losa.activity;



import org.springframework.beans.factory.annotation.Autowired;

import com.usky.sms.core.AbstractService;
import com.usky.sms.losa.score.ScoreDao;
import com.usky.sms.losa.score.ScoreSelectContentDao;
import com.usky.sms.losa.scoreTemplet.ScoreTempletDao;


public class ObserveActivityService extends AbstractService{
	
	@Autowired
	private ObserveActivityDao observeActivityDao;
	@Autowired
	private ScoreDao scoreDao;
	@Autowired
	private ScoreTempletDao scoreTempletDao;
	@Autowired
	private ScoreSelectContentDao scoreSelectContentDao;
	
	
	public ObserveActivityDao getObserveActivityDao() {
		return observeActivityDao;
	}

	public void setObserveActivityDao(ObserveActivityDao observeActivityDao) {
		this.observeActivityDao = observeActivityDao;
	}

	public ScoreDao getScoreDao() {
		return scoreDao;
	}

	public void setScoreDao(ScoreDao scoreDao) {
		this.scoreDao = scoreDao;
	}

	public ScoreTempletDao getScoreTempletDao() {
		return scoreTempletDao;
	}

	public void setScoreTempletDao(ScoreTempletDao scoreTempletDao) {
		this.scoreTempletDao = scoreTempletDao;
	}

	public ScoreSelectContentDao getScoreSelectContentDao() {
		return scoreSelectContentDao;
	}

	public void setScoreSelectContentDao(ScoreSelectContentDao scoreSelectContentDao) {
		this.scoreSelectContentDao = scoreSelectContentDao;
	}
	

}
