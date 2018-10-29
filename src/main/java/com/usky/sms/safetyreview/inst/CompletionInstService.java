package com.usky.sms.safetyreview.inst;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.google.gson.reflect.TypeToken;
import com.usky.sms.common.ResponseHelper;
import com.usky.sms.constant.MessageCodeConstant;
import com.usky.sms.core.AbstractService;
import com.usky.sms.core.SMSException;
import com.usky.sms.safetyreview.EnumMethanolStatus;

public class CompletionInstService extends AbstractService {
	
	@Autowired
	private CompletionInstDao completionInstDao;
	
	@Autowired
	private MethanolInstDao methanolInstDao;

	/**
	 * 更新多个完成情况
	 * @param request
	 * @param response
	 */
	@Transactional(readOnly = false, propagation = Propagation.REQUIRES_NEW, isolation = Isolation.READ_COMMITTED)
	public void updateCompletionInsts(HttpServletRequest request, HttpServletResponse response){
		try {
			// 操作(提交:commit，保存:save)
			int methanolId = Integer.parseInt(request.getParameter("methanolId"));
			MethanolInstDO methanol = methanolInstDao.internalGetById(methanolId);
			// 校验(如果状态是待审核，则不能再次提交)
			if (EnumMethanolStatus.WAITING.toString().equals(methanol.getStatus())) {
				throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "该评审单已经被提交过了，不能再进行保存或提交操作！");
			}
			String operation = (String) request.getParameter("operation");
			String objs = request.getParameter("completionInsts");
			List<Map<String, Object>> maps = gson.fromJson(objs, new TypeToken<List<Map<String, Object>>>() {}.getType());
			// 保存和提交时都要保存一下完成情况
			for (Map<String, Object> map : maps) {
				int id = ((Double) map.get("id")).intValue();
				map.remove("id");
				completionInstDao.update(id, map);
			}
			if ("commit".equals(operation)) {
				// 更新评审单的状态到待审核WAITING
				methanol.setStatus(EnumMethanolStatus.WAITING.toString());
				methanolInstDao.update(methanol);
			}

			Map<String, Object> result = new HashMap<String, Object>();

			result.put("success", true);

			ResponseHelper.output(response, result);

		} catch (SMSException e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}


	public void setCompletionInstDao(CompletionInstDao completionInstDao) {
		this.completionInstDao = completionInstDao;
	}


	public void setMethanolInstDao(MethanolInstDao methanolInstDao) {
		this.methanolInstDao = methanolInstDao;
	}

}
