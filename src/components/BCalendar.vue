<template>
  <v-container fluid>
    <v-row class="fill-height">
      <v-col>
        <v-card>
          <v-sheet height="64">
            <v-toolbar flat color="white">
              <v-btn
                outlined
                class="mr-4"
                color="grey darken-2"
                @click="setToday"
              >
                Today
              </v-btn>
              <v-btn fab text small color="grey darken-2" @click="prev">
                <v-icon small>mdi-chevron-left</v-icon>
              </v-btn>
              <v-btn fab text small color="grey darken-2" @click="next">
                <v-icon small>mdi-chevron-right</v-icon>
              </v-btn>
              <v-toolbar-title>{{ title }}</v-toolbar-title>
              <v-spacer></v-spacer>

                  <v-menu bottom left>
                    <template v-slot:activator="{ on }">
                      <v-btn outlined color="grey darken-2" v-on="on">
                        <span>{{ tester }}</span>
                        <v-icon right>mdi-menu-down</v-icon>
                      </v-btn>
                    </template>
                    <v-list>
                      <v-list-item @click="getEvents()">
                        <v-list-item-title>All</v-list-item-title>
                      </v-list-item>
                      <v-list-item v-for="(name, index) in namesToSched" :key="index"
                      @click="getEvents(name)">
                        <v-list-item-title>{{name}}</v-list-item-title>
                      </v-list-item>
                    </v-list>
                  </v-menu>

                  <v-menu bottom right>
                    <template v-slot:activator="{ on }">
                      <v-btn outlined color="grey darken-2" v-on="on">
                        <span>{{ typeToLabel[type] }}</span>
                        <v-icon right>mdi-menu-down</v-icon>
                      </v-btn>
                    </template>
                    <v-list>
                      <v-list-item @click="changeCalType('day')">
                        <v-list-item-title>Day</v-list-item-title>
                      </v-list-item>
                      <v-list-item @click="changeCalType('week')">
                        <v-list-item-title>Week</v-list-item-title>
                      </v-list-item>
                      <v-list-item @click="changeCalType('month')">
                        <v-list-item-title>Month</v-list-item-title>
                      </v-list-item>
                      <v-list-item @click="changeCalType('4day')">
                        <v-list-item-title>4 days</v-list-item-title>
                      </v-list-item>
                    </v-list>
                  </v-menu>
            </v-toolbar>
          </v-sheet>
          <v-sheet height="600">
            <v-calendar
              ref="calendar"
              v-model="focus"
              color="primary"
              :events="events"
              :event-color="getEventColor"
              :now="today"
              :type="type"
              @click:event="showEvent"
              @click:more="viewDay"
              @click:date="viewDay"
              @click:day="viewDay"
              @change="updateRange"
              @mousedown:event="startDrag"
              @mousedown:time="startCreateTime"
              @mousemove:time="mouseMove"
              @mouseup:time="endDrag"
              @mouseleave.native="cancelDrag"
            >
              <template #event="{ event, timed, eventSummary }">
                <div class="v-event-draggable p-3 m-3">
                  {{formatTime(event.start)}} <strong>{{event.name}}</strong>
                </div>
                <div
                  v-if="timed"
                  class="v-event-drag-bottom"
                  @mousedown.stop="extendBottom(event)"
                ></div>
              </template>
            </v-calendar>
            <v-menu
              v-model="selectedOpen"
              :close-on-content-click="false"
              :activator="selectedElement"
              offset-x
            >
              <v-card color="grey lighten-4" :width="350" flat>
                <v-toolbar
                  :color="selectedEvent.color"
                  dark
                >
                  <v-toolbar-title v-html="selectedEvent.name"></v-toolbar-title>

                  <v-spacer></v-spacer>

                  <v-menu bottom left>
                    <template v-slot:activator="{ on, attrs }">
                      <v-btn
                        dark
                        icon
                        v-bind="attrs"
                        v-on="on"
                      >
                        <v-icon>mdi-dots-vertical</v-icon>
                      </v-btn>
                    </template>

                    <v-list>
                       <v-list-item  @click.prevent="editEvent(selectedEvent)">
                        <v-list-item-title>Edit</v-list-item-title>
                      </v-list-item>
                      <v-list-item @click="deleteEvent(selectedEvent.id)">
                        <v-list-item-title>Delete</v-list-item-title>
                      </v-list-item>
                    </v-list>
                  </v-menu>
                </v-toolbar>


                <v-card-text>
                  <form v-if="currentlyEditing !== selectedEvent.id">
                    {{ selectedEvent.details }}
                  </form>
                  <form v-else>
                    <textarea-autosize
                    v-model="selectedEvent.details"
                    type="text"
                    style="width: 100%"
                    :min-height="100"
                    placeholder="add note">
                  </textarea-autosize>
                  </form>
                </v-card-text>

                <v-card-actions>
                  <v-btn text color="secondary" @click="selectedOpen = false">
                    close
                  </v-btn>
                  <v-btn text v-if="currentlyEditing == selectedEvent.id" type="submit" @click.prevent="updateEvent(selectedEvent)">
                    Save
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-menu>
          </v-sheet>
        </v-card>
      </v-col>
      <v-dialog v-model="newEventDialog" persistent max-width="500">
        <template v-slot:activator="{ on }">
          <v-card-text style="height: 100px; position: relative">
            <v-fab-transition>
              <v-btn color="pink" dark absolute top right fab v-on="on">
                <v-icon>mdi-plus</v-icon>
              </v-btn>
            </v-fab-transition>
          </v-card-text>
        </template>

        <v-card color="grey lighten-4">
          <v-toolbar color="primary" dark flat>
            <v-toolbar-title>New Time Slot</v-toolbar-title>

            <v-spacer></v-spacer>

            <v-btn icon @click="closeNewEventDialog">
              <v-icon small>mdi-close</v-icon>
            </v-btn>
          </v-toolbar>

          <v-divider></v-divider>

          <v-card-text>
            <v-list color="grey lighten-4" flat>
              <v-list-item-group color="primary">
                <v-list-item class="px-0 mx-0 my-1" :ripple="false">
                  <v-list-item-icon class="mr-2">
                    <v-icon> mdi-flag</v-icon>
                  </v-list-item-icon>
                  <v-list-item-content class="ml-1">
                    <v-select
                      :items="namesToSched"
                      v-model="name"
                      label="Tester"
                      filled
                      dense
                    ></v-select>
                  </v-list-item-content>
                </v-list-item>
                <v-list-item class="ev-list px-0 mx-0 my-1" :ripple="false">
                  <v-list-item-icon class="mr-2">
                    <v-icon> mdi-file</v-icon>
                  </v-list-item-icon>
                  <v-list-item-content class="ev-list ml-1 mt-0 pt-0">
                    <v-textarea
                      v-model="details"
                      label="Notes"
                      auto-grow
                      filled
                      rows="2"
                      row-height="22"
                    ></v-textarea>
                  </v-list-item-content>
                </v-list-item>
                <v-list-item class="px-0 mx-0" :ripple="false">
                  <v-list-item-icon class="mr-2">
                    <v-icon> mdi-av-timer</v-icon>
                  </v-list-item-icon>
                  <v-list-item-content class="ev-list ml-1 px-0 pt-0">
                    <v-row align="center" class="pt-0">
                      <v-col sm="6" md="5" class="pt-0">
                        <v-dialog
                          ref="dateDialog"
                          v-model="dateModal"
                          :return-value.sync="selectedDate"
                          persistent
                          width="290px"
                        >
                          <template v-slot:activator="{ on }">
                            <v-text-field
                              v-model="selectedDate"
                              label="Date"
                              readonly
                              :disabled="type == 'day'"
                              v-on="on"
                              class="pt-0"
                            ></v-text-field>
                          </template>
                          <v-date-picker v-model="selectedDate" no-title scrollable>
                            <v-spacer></v-spacer>
                            <v-btn
                              text
                              color="primary"
                              @click="dateModal = false"
                              >Cancel</v-btn
                            >
                            <v-btn
                              text
                              color="primary"
                              @click="$refs.dateDialog.save(selectedDate)"
                              >OK</v-btn
                            >
                          </v-date-picker>
                        </v-dialog>
                      </v-col>
                      <v-col sm="6" md="3" class="pt-0">
                        <v-dialog
                          ref="startTimeDialog"
                          v-model="startTimeModal"
                          :return-value.sync="startRangeTime"
                          persistent
                          width="290px"
                        >
                          <template v-slot:activator="{ on }">
                            <v-row>
                              <v-col cols="12">
                                <v-text-field
                                  v-model="startRangeTime"
                                  label="Start Time"
                                  readonly
                                  v-on="on"
                                  class="pt-0"
                                ></v-text-field>
                              </v-col>
                            </v-row>
                          </template>
                          <v-time-picker
                            v-if="startTimeModal"
                            v-model="startRangeTime"
                            :max="endRangeTime"
                            full-width
                          >
                            <v-spacer></v-spacer>
                            <v-btn
                              text
                              color="primary"
                              @click="startTimeModal = false"
                              >Cancel</v-btn
                            >
                            <v-btn
                              text
                              color="primary"
                              @click="
                                $refs.startTimeDialog.save(startRangeTime)
                              "
                              >OK</v-btn
                            >
                          </v-time-picker>
                        </v-dialog>
                      </v-col>
                      <v-col sm="6" md="3" class="pt-0">
                        <v-dialog
                          ref="endTimeDialog"
                          v-model="endTimeModal"
                          :return-value.sync="endRangeTime"
                          persistent
                          width="290px"
                        >
                          <template v-slot:activator="{ on }">
                            <v-row>
                              <v-col cols="12">
                                <v-text-field
                                  v-model="endRangeTime"
                                  label="End Time"
                                  readonly
                                  v-on="on"
                                  class="pt-0"
                                ></v-text-field>
                              </v-col>
                            </v-row>
                          </template>
                          <v-time-picker
                            v-if="endTimeModal"
                            v-model="endRangeTime"
                            :min="startRangeTime"
                            full-width
                          >
                            <v-spacer></v-spacer>
                            <v-btn
                              text
                              color="primary"
                              @click="endTimeModal = false"
                              >Cancel</v-btn
                            >
                            <v-btn
                              text
                              color="primary"
                              @click="$refs.endTimeDialog.save(endRangeTime)"
                              >OK</v-btn
                            >
                          </v-time-picker>
                        </v-dialog>
                      </v-col>
                    </v-row>
                  </v-list-item-content>
                </v-list-item>
              </v-list-item-group>
            </v-list>
          </v-card-text>

          <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn
                text
                color="grey darken"
                @click="closeNewEventDialog"
              >
                Cancel
              </v-btn>

            <v-btn color="primary" text @click="addEvent">
              <v-icon left>mdi-content-save</v-icon> Save
            </v-btn>
            </v-card-actions>
        </v-card>
      </v-dialog>
    </v-row>
  </v-container>
</template>

<script>
import { db } from '@/firebase'

export default {
  data: () => ({
    focus: "",
    tester: "all",
    type: "month",
    typeToLabel: {
      month: "Month",
      week: "Week",
      day: "Day",
      "4day": "4 Days"
    },
    currentlyEditing: null,
    selectedEvent: {},
    selectedElement: null,
    selectedOpen: false,
    events: [],
    colors: ["blue", "green", "orange"],
    namesToSched: ["ETS 800", "FLEX", "NEXTEST"],
    newEventDialog: false,
    startTime: {},
    endTime: {},
    dateModal: false,
    startTimeModal: false,
    endTimeModal: false,
    selectedDate: null,
    startRangeTime: null,
    endRangeTime: null,
    dragEvent: null,
    dragStart: null,
    createEvent: null,
    createStart: null,
    extendOriginal: null,
  }),
  computed: {
    title() {
      const { start, end } = this;
      if (!start || !end) {
        return "";
      }

      const startMonth = this.monthFormatter(start);
      const endMonth = this.monthFormatter(end);
      const suffixMonth = startMonth === endMonth ? "" : endMonth;

      const startYear = start.year;
      const endYear = end.year;
      const suffixYear = startYear === endYear ? "" : endYear;

      const startDay = start.day + this.nth(start.day);
      const endDay = end.day + this.nth(end.day);

      switch (this.type) {
        case "month":
          return `${startMonth} ${startYear}`;
        case "week":
        case "4day":
          return `${startMonth} ${startDay} ${startYear} - ${suffixMonth} ${endDay} ${suffixYear}`;
        case "day":
          return `${startMonth} ${startDay} ${startYear}`;
      }
      return "";
    },
    monthFormatter() {
      return this.$refs.calendar.getFormatter({
        timeZone: "UTC",
        month: "long"
      });
    },
  },
  mounted () {
    this.getEvents(this.tester)
  },
  methods: {
    changeCalType(type) {
      this.type = type;
      if (type != 'day') {
        this.selectedDate = null;
        this.start = null;
        this.startRangeTime = null;
        this.end = null;
        this.endRangeTime = null;
      }
    },
    viewDay({ date }) {
      this.focus = date;
      this.type = "day";
      this.selectedDate = date;
    },
    getEventColor(event) {
      return event.color;
    },
    setToday() {
      this.focus = this.today;
    },
    prev() {
      this.$refs.calendar.prev();
    },
    next() {
      this.$refs.calendar.next();
    },
    showEvent({ nativeEvent, event }) {
      const open = () => {
        this.selectedEvent = event;
        this.selectedElement = nativeEvent.target;
        setTimeout(() => (this.selectedOpen = true), 10);
      };

      if (this.selectedOpen) {
        this.selectedOpen = false;
        setTimeout(open, 10);
      } else {
        this.newEventDialog = false
        open();
      }

      nativeEvent.stopPropagation();
    },
    editEvent (ev) {
      this.currentlyEditing = ev.id
    },
    async getEvents (tester = 'all') {
      this.tester = tester;
      let snapshot = tester == 'all'
       ? await db.collection('calEvent').get()
       : await db.collection('calEvent').where("name", "==", tester).get()

      const events = []
      snapshot.forEach(doc => {
        let appData = doc.data()
        appData.id = doc.id
        events.push(appData)
      })
      this.events = events
    },
    editEvent (ev) {
      this.currentlyEditing = ev.id
    },
    async updateEvent (ev) {
      await db.collection('calEvent').doc(this.currentlyEditing).update({
        details: ev.details
      })
      this.selectedOpen = false,
      this.currentlyEditing = null
    },
    async deleteEvent (ev) {
      await db.collection("calEvent").doc(ev).delete()
      this.selectedOpen = false,
      this.getEvents(this.tester)
    },
    async addEvent () {
      if (this.startRangeTime) {
        this.start = this.selectedDate + ' ' + this.startRangeTime
      }
      if (this.endRangeTime) {
        this.end = this.selectedDate + ' ' + this.endRangeTime
      }
      if (this.name && this.start && this.end) {
        await db.collection("calEvent").add({
          name: this.name,
          details: this.details,
          start: this.start,
          end: this.end,
          color: this.testerColor(this.name)
        })
        this.getEvents(this.tester)
        this.name = null;
        this.details = null;
        this.start = null;
        this.end = null;
        this.color = null;
      } else {
        alert('You must enter event name, start, and end time')
      }
      this.closeNewEventDialog()
    },
    closeNewEventDialog() {
      this.newEventDialog = false;
      this.getEvents(this.tester);
    },
    updateRange({ start, end }) {
      this.start = start;
      this.end = end;
    },
    nth(d) {
      return d > 3 && d < 21
        ? "th"
        : ["th", "st", "nd", "rd", "th", "th", "th", "th", "th", "th"][d % 10];
    },
    rnd(a, b) {
      return Math.floor((b - a + 1) * Math.random()) + a;
    },
    rndElement (arr) {
      return arr[this.rnd(0, arr.length - 1)]
    },
    formatDate(a, withTime) {
      return withTime
        ? `${a.getFullYear()}-${a.getMonth() +
            1}-${a.getDate()} ${a.getHours()}:${a.getMinutes()}`
        : `${a.getFullYear()}-${a.getMonth() + 1}-${a.getDate()}`;
    },
    formatTime(date) {
      const dt = new Date(date);
      let hours = dt.getHours() ; // gives the value in 24 hours format
      const AmOrPm = hours >= 12 ? 'PM' : 'AM';
      hours = (hours % 12) || 12;
      const minutes = dt.getMinutes() ;
      return hours + ":" + minutes + " " + AmOrPm; 
    },
    testerColor(tester) {
      const index = this.namesToSched.findIndex(name => name == tester);
      return this.colors[index];
    },
    startDrag ({ event, timed }) {
      if (event && timed) {
        this.dragEvent = event
        this.dragTime = null
        this.extendOriginal = null
      }
    },
    startCreateTime (tms) {
      this.startRangeTime = tms.time;
      const mouse = this.toTime(tms)

      if (this.dragEvent && this.dragTime === null) {
        const start = this.dragEvent.start
        this.dragTime = mouse - start
      } else {
        this.createStart = this.roundTime(mouse)
        this.createEvent = {
          name: '',
          color: 'blue',
          start: this.createStart,
          end: this.createStart,
          timed: true,
        }

        this.events.push(this.createEvent)
      }
    },
    extendBottom (event) {
      this.createEvent = event
      this.createStart = event.start
      this.extendOriginal = event.end
    },
    mouseMove (tms) {
      const mouse = this.toTime(tms)

      if (this.dragEvent && this.dragTime !== null) {
        const start = this.dragEvent.start
        const end = this.dragEvent.end
        const duration = end - start
        const newStartTime = mouse - this.dragTime
        const newStart = this.roundTime(newStartTime)
        const newEnd = newStart + duration

        this.dragEvent.start = newStart
        this.dragEvent.end = newEnd
      } else if (this.createEvent && this.createStart !== null) {
        const mouseRounded = this.roundTime(mouse, false)
        const min = Math.min(mouseRounded, this.createStart)
        const max = Math.max(mouseRounded, this.createStart)

        this.createEvent.start = min
        this.createEvent.end = max
      }
    },
    endDrag (time) {
      this.endRangeTime = time.time;
      this.newEventDialog = true;
      this.dragTime = null
      this.dragEvent = null
      this.createEvent = null
      this.createStart = null
      this.extendOriginal = null
    },
    cancelDrag () {
      if (this.createEvent) {
        if (this.extendOriginal) {
          this.createEvent.end = this.extendOriginal
        } else {
          const i = this.events.indexOf(this.createEvent)
          if (i !== -1) {
            this.events.splice(i, 1)
          }
        }
      }

      this.createEvent = null
      this.createStart = null
      this.dragTime = null
      this.dragEvent = null
    },
    roundTime (time, down = true) {
      const roundTo = 15 // minutes
      const roundDownTime = roundTo * 60 * 1000

      return down
        ? time - time % roundDownTime
        : time + (roundDownTime - (time % roundDownTime))
    },
    toTime (tms) {
      return new Date(tms.year, tms.month - 1, tms.day, tms.hour, tms.minute).getTime()
    },
  }
};
</script>

<style scoped lang="scss">
#cal-filter {
  width: 300px;
}
.v-event-draggable {
  padding-left: 6px;
}

.v-event-timed {
  user-select: none;
  -webkit-user-select: none;
}

.v-event-drag-bottom {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 4px;
  height: 4px;
  cursor: ns-resize;

  &::after {
    display: none;
    position: absolute;
    left: 50%;
    height: 4px;
    border-top: 1px solid white;
    border-bottom: 1px solid white;
    width: 16px;
    margin-left: -8px;
    opacity: 0.8;
    content: '';
  }

  &:hover::after {
    display: block;
  }
}
</style>
