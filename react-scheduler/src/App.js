import { EditingState, ViewState } from "@devexpress/dx-react-scheduler";
import {
  Appointments,
  DateNavigator,
  DayView,
  MonthView,
  Scheduler,
  Toolbar,
  ViewSwitcher,
  WeekView,
} from "@devexpress/dx-react-scheduler-material-ui";
import { Paper } from "@mui/material";
import { initializeApp } from "firebase/app";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  getFirestore,
  updateDoc,
} from "firebase/firestore";
import moment from "moment";
import "moment/locale/pl";
import React, { useEffect, useState } from "react";

const firebaseConfig = {
  apiKey: "AIzaSyAhhho5DIY1n8gnILcONulDVCQwVz_-3zo",
  authDomain: "scheduler-36fad.firebaseapp.com",
  projectId: "scheduler-36fad",
  storageBucket: "scheduler-36fad.appspot.com",
  messagingSenderId: "176705393472",
  appId: "1:176705393472:web:182c0fc043a15d416ce0a5",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

moment.locale("pl");

const App = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentViewName, setCurrentViewName] = useState("Week");
  const [events, setEvents] = useState([]);
  const [addedAppointment, setAddedAppointment] = useState({});
  const [appointmentChanges, setAppointmentChanges] = useState({});
  const [editingAppointment, setEditingAppointment] = useState(undefined);

  const fetchEvents = async () => {
    const querySnapshot = await getDocs(collection(db, "events"));
    const eventsData = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      startDate: doc.data().startDate.toDate(),
      endDate: doc.data().endDate.toDate(),
      title: doc.data().title,
    }));
    setEvents(eventsData);
  };

  const addEvent = async (event) => {
    await addDoc(collection(db, "events"), event);
    fetchEvents();
  };

  const updateEvent = async (id, changes) => {
    const eventRef = doc(db, "events", id);
    await updateDoc(eventRef, changes);
    fetchEvents();
  };

  const deleteEvent = async (id) => {
    await deleteDoc(doc(db, "events", id));
    fetchEvents();
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const commitChanges = ({ added, changed, deleted }) => {
    if (added) {
      const eventToAdd = {
        ...added,
        startDate: new Date(added.startDate),
        endDate: new Date(added.endDate),
      };
      addEvent(eventToAdd);
    }
    if (changed) {
      const eventId = Object.keys(changed)[0];
      const eventToUpdate = events.find((event) => event.id === eventId);
      if (eventToUpdate) {
        const updatedEvent = { ...eventToUpdate, ...changed[eventId] };
        updateEvent(eventId, updatedEvent);
      }
    }
    if (deleted !== undefined) {
      deleteEvent(deleted);
    }
  };

  return (
    <Paper>
      <Scheduler data={events}>
        <ViewState
          currentDate={currentDate}
          onCurrentDateChange={setCurrentDate}
          currentViewName={currentViewName}
          onCurrentViewNameChange={setCurrentViewName}
        />
        <EditingState
          onCommitChanges={commitChanges}
          addedAppointment={addedAppointment}
          onAddedAppointmentChange={setAddedAppointment}
          appointmentChanges={appointmentChanges}
          onAppointmentChangesChange={setAppointmentChanges}
          editingAppointment={editingAppointment}
          onEditingAppointmentChange={setEditingAppointment}
        />
        <DayView startDayHour={9} endDayHour={19} />
        <WeekView startDayHour={9} endDayHour={19} />
        <MonthView />
        <Toolbar />
        <DateNavigator />
        <ViewSwitcher />
        <Appointments />
      </Scheduler>
    </Paper>
  );
};

export default App;
