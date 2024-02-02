import { call, put, takeLatest, select } from "redux-saga/effects";
import { Actions, Types } from "~store/reducers";
import api from "~services/api";
import AsyncStorage from '@react-native-async-storage/async-storage';



export function* fetchUsersRequest() {
  const config = yield select((state) => state.users.config);

  try {
    const token = yield call([AsyncStorage, 'getItem'], 'token');

    const { data: response } = yield call(api.get, "/api/recommend/", {
      headers: {
        Authorization : 'Token ' + token
      },
      params: {
        page: config.nextPage,
        limit: config.limit,
      },
    });

    if(response != null && response != undefined ){
      yield put(
        Actions.users.list.success({
          users: response,
          nextPage: config.nextPage + 1,
          hasMore: true,
        })
      );
    }

  } catch (err) {
    const error = { message: "We're having troubles finding your next matches" };
    yield put(Actions.users.list.failure(error));
  }
}

export default takeLatest(Types.FETCH_USERS_REQUEST, fetchUsersRequest);
