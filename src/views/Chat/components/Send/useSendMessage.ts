// import moment from "moment";
// import uuid from "react-native-uuid";
// import { Creators, useContext } from "~views/Chat/store";
// import { FeedbackStatus } from "../Feedback";

// // Should be a saga or something
// export default function Component() {
//   const { dispatch } = useContext();

//   const submit = async (body: string) => {
//     const tempId = uuid.v4() as string;

//     try {
//       // Add a fake 'sending' message to give an optimistic UI
//       dispatch(Creators.addTemp({ message_id: tempId, body }));

//       // You could send the actual message here. For now, we'll just fake it.
//       // const { data: response } = await axios.post("chat", {
//       //   message,
//       // });

//       await new Promise((resolve) => setTimeout(resolve, 500));

//       // Remove the fake message and add the correct one
//       dispatch(Creators.removeTemp({ message_id: tempId }));
//       // dispatch(
//       //   Creators.addMessage({
//       //     message: {
//       //       message_id: uuid.v4().toString(),
//       //       message: body,
//       //       sent_at: moment().toISOString(),
//       //       self_sender: true,
//       //       status: FeedbackStatus.Success,
//       //     },
//       //   })
//       // );
//     } catch (err) {
//       // Set error and delete the fake message after a while
//       dispatch(Creators.errorTemp({ message_id: tempId }));
//       setTimeout(() => dispatch(Creators.removeTemp({ message_id: tempId })), 1500);
//     }
//   };

//   return submit;
// }
