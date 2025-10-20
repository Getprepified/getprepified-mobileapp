import { Stack } from 'expo-router';

const ParentLayout = () => {
  return (
    <Stack>
      <Stack.Screen
        name="dashboard"
        options={{
          headerShown: false,
          title: 'Parent Dashboard',
        }}
      />
      <Stack.Screen
        name="students"
        options={{
          headerShown: false,
          title: 'Students',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name="students/[studentId]"
        options={{
          headerShown: false,
          title: 'Student Details',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name="students/[studentId]/tests"
        options={{
          headerShown: false,
          title: 'Student Tests',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name="courses"
        options={{
          headerShown: false,
          title: 'Courses',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name="settings-page"
        options={{
          headerShown: false,
          title: 'settings',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name="tests"
        options={{
          headerShown: false,
          title: 'Tests',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name="test/[testId]"
        options={{
          headerShown: false,
          title: 'Test Details',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name="courses/[courseId]"
        options={{
          headerShown: false,
          title: 'Course Details',
          headerBackTitle: 'Back',
        }}
      />
    </Stack>
  );
};

export default ParentLayout;