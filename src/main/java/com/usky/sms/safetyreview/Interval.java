package com.usky.sms.safetyreview;

public class Interval {

	/** 左区间,最小值为0,不能为null */
	private Integer left;

	/** 右区间,null表示正无穷 */
	private Integer right;

	/** 步长,null表示没有步数 */
	private Integer step;

	/** 分数 */
	private Double score;
	
	public Interval(){};
	
	/**
	 * 
	 * @param left 左区间
	 * @param right 右区间 
	 * @param step 步数
	 * @param score 分数
	 */
	public Interval(Integer left, Integer right, Integer step, Double score) {
		this.left = left;
		this.right = right;
		this.step = step;
		this.score = score;
	}

	/**
	 * @return the left
	 */
	public Integer getLeft() {
		return left;
	}

	/**
	 * @param left the left to set
	 */
	public void setLeft(Integer left) {
		this.left = left;
	}

	/**
	 * @return the right
	 */
	public Integer getRight() {
		return right;
	}

	/**
	 * @param right the right to set
	 */
	public void setRight(Integer right) {
		this.right = right;
	}

	/**
	 * @return the step
	 */
	public Integer getStep() {
		return step;
	}

	/**
	 * @param step the step to set
	 */
	public void setStep(Integer step) {
		this.step = step;
	}

	/**
	 * @return the score
	 */
	public Double getScore() {
		return score;
	}

	/**
	 * @param score the score to set
	 */
	public void setScore(Double score) {
		this.score = score;
	}
}
