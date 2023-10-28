import produce from "immer";
import { action, createReducer } from "typesafe-actions";
import { FeedbackStatus } from "../components/Feedback";
import moment from "moment";
import { Message } from "../components";

export interface Message {
  message_id: string;
  message: string;
  sent_at: string;
  status: FeedbackStatus;
  sender: string;
  image : string;
  self_sender : boolean;
}

export interface State {
  messages: Message[];
  buffer: Message[];
}

// export const INITIAL_STATE = (messages : Message[]) =>  {return ({messages: messages as Message[], buffer: []}) as State};

export const INITIAL_STATE : State = {
  messages: [],
  buffer: []
}

export enum Types {
  SET_MESSAGES = "SET_MESSAGES",
  ADD_MESSAGE = "ADD_MESSAGE",
  ADD_TEMP = "ADD_TEMP",
  REMOVE_TEMP = "REMOVE_TEMP",
  ERROR_TEMP = "ERROR_TEMP",
}

export const Creators = {
  setMessages: ({ messages }: { messages: Message[] }) => action(Types.SET_MESSAGES, { messages }),
  addMessage: ({ message }: { message: Message }) => action(Types.ADD_MESSAGE, { message }),
  addTemp: ({ message_id, body }: { message_id: string; body: string }) => action(Types.ADD_TEMP, { message_id, body }),
  removeTemp: ({ message_id }: { message_id: string }) => action(Types.REMOVE_TEMP, { message_id }),
  errorTemp: ({ message_id }: { message_id: string }) => action(Types.ERROR_TEMP, { message_id }),
};

const setMessages = (state = INITIAL_STATE, { payload: { messages } }) =>
  produce(state, (draft) => {
    if (!messages || messages.length === draft.messages?.length) return draft;
    draft.messages = messages;
    return draft;
  });

const addMessage = (state = INITIAL_STATE, { payload: { message } }) =>
  produce(state, (draft) => {
    draft.messages.unshift(message);
    return draft;
  });

const addTemp = (state = INITIAL_STATE, { payload: { message_id, body } }) =>
  produce(state, (draft) => {
    draft.buffer.unshift({
      message_id : message_id,
      message: body,
      sent_at: moment().toISOString(),
      status: FeedbackStatus.Loading,
      image: body,
      self_sender: true,
    } as Message);
    return draft;
  });


const removeTemp = (state = INITIAL_STATE, { payload: { message_id } }) =>
  produce(state, (draft) => {
    const index = draft.buffer.findIndex((message) => message.message_id === message_id);
    draft.buffer.splice(index, 1);
    return draft;
  });

const errorTemp = (state = INITIAL_STATE, { payload: { message_id } }) =>
  produce(state, (draft) => {
    const index = draft.buffer.findIndex((message) => message.message_id === message_id);
    draft.buffer[index].status = FeedbackStatus.Error;
    return draft;
  });

export default createReducer<typeof INITIAL_STATE>(INITIAL_STATE)
  .handleAction(Types.SET_MESSAGES, setMessages)
  .handleAction(Types.ADD_MESSAGE, addMessage)
  .handleAction(Types.ADD_TEMP, addTemp)
  .handleAction(Types.ERROR_TEMP, errorTemp)
  .handleAction(Types.REMOVE_TEMP, removeTemp);
