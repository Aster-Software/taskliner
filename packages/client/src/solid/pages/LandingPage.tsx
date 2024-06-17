import { styled, Container, Grid, HStack } from "@style/jsx";
import { makeAutoObservable } from "mobx";
import { Button } from "../components/Button";

export const LandingPage = () => {
  const state = makeAutoObservable({
    count: 0,

    increment: () => state.count++,
  });
  return (
    <div>
      <styled.div bg="radial-gradient(at 50% 25%, #b3ddf888, #b3ddf8)">
        <Container>
          <HStack height={20} gap={4}>
            <styled.div flexGrow={1}>Taskliner</styled.div>
            <div>Pricing</div>
            <div>Docs</div>
            <div>Log In</div>
            <div>Sign Up</div>
          </HStack>
          <styled.div height="10vh" />
          <styled.h1 fontSize="2vw" fontWeight={500}>
            Stay On Top Of Your Development Progress
          </styled.h1>
          <styled.div height="5vh" />
          <div>A Project Manager that keeps you hyper focused on your team's deadlines.</div>
          <styled.div height="10vh" />
        </Container>
      </styled.div>
      <Container py={8}>
        <styled.h2 fontSize="30px"></styled.h2>
        <div></div>
      </Container>
      <Container py={8}>
        <styled.h2 fontSize="30px">Keep Your Team Focused</styled.h2>
        <div>Do your employees know what the company's most important goals are for this week? This month? This year?</div>
        <div>
          Make sure your team knows what the priorities are and what they are not. Don't let them waste effort on things that won't move the needle in the
          coming months.
        </div>
        <div>
          Taskliner serves as a central planning dashboard for your entire business, so that all your plans, deadlines, and requirements are crystal clear for
          everyone on your team.
        </div>
      </Container>
      <Container py={8}>
        <styled.h2 fontSize="30px">Fix Your Long Term Time Management</styled.h2>
        <div>Stop letting your projects drag on for months.</div>
        <div>We know - it's not easy to plan things, and it's especially not easy to plan things on a time horizon of multiple months or years.</div>
        <div>We force you to put deadlines on things so that you have a concrete plan for getting it done - and know when your team is overbooked.</div>
      </Container>
    </div>
  );
};
