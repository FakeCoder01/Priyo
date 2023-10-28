import React, {useState} from "react";
import { SafeAreaView } from "react-native";
import DateTimePicker from '@react-native-community/datetimepicker';



const DatePicker = ({DOB='2005-10-30', showDateModal, setShowDateModal, setDOBDate}) => {
    if (DOB != null && DOB != undefined && DOB != '') {
        DOB = '2005-10-30';
    }
    const [date, setDate] = useState(new Date(DOB));

    const onChange = (event, selectedDate) => {
      const currentDate = selectedDate;
      setShowDateModal(false);
      setDOBDate(currentDate.toLocaleDateString('fr-CA', { year: 'numeric', month: '2-digit', day: '2-digit' }));
    };


    return (
      <SafeAreaView>
        {showDateModal && (
          <DateTimePicker
            testID="dateTimePicker"
            value={date}
            is24Hour={true}
            onChange={onChange}
          />
        )}
      </SafeAreaView>
    );
};

export default DatePicker;